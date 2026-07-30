const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start with an insecure default.');
  process.exit(1);
}
const now = () => new Date().toISOString();

// Only allow requests from known frontend origins (prevents random sites from
// making authenticated requests using a visitor's browser/cookies).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://natural-ice.vercel.app,https://naturalice.ae,http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin/non-browser requests (no Origin header) and any whitelisted origin.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rate limit brute-force attempts on auth endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Wrap async route handlers so rejected promises are forwarded to Express's
// error handling instead of crashing the request silently.
function ah(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// ---------- Helpers ----------

function rowToUser(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return { ...rest, full_name: rest.display_name || rest.full_name, email: rest.email };
}

function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
}

async function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [payload.id]);
    if (!user) return res.status(401).json({ error: 'unauthenticated' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthenticated' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  next();
}

// ---------- Auth routes ----------

app.post('/api/auth/register', ah(async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const existing = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) return res.status(409).json({ error: 'user already exists' });
  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  await db.run(`INSERT INTO users (id, email, password_hash, full_name, display_name, role, created_date, updated_date)
    VALUES (?, ?, ?, ?, ?, 'client', ?, ?)`,
    [id, email.toLowerCase(), hash, full_name || '', full_name || '', now(), now()]);
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  const token = sign(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000 });
  res.json(rowToUser(user));
}));

app.post('/api/auth/login', ah(async (req, res) => {
  const { email, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE email = ?', [(email || '').toLowerCase()]);
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = sign(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000 });
  res.json(rowToUser(user));
}));

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json(rowToUser(req.user));
});

app.put('/api/auth/me', auth, ah(async (req, res) => {
  const fields = req.body || {};
  const allowed = ['full_name', 'display_name', 'phone'];
  const updates = [];
  const values = [];
  for (const k of allowed) {
    if (k in fields) {
      updates.push(`${k} = ?`);
      values.push(fields[k]);
    }
  }
  if (updates.length) {
    updates.push('updated_date = ?');
    values.push(now());
    values.push(req.user.id);
    await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
  }
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json(rowToUser(user));
}));

// Invite user (admin only) - creates account with a chosen or generated password
app.post('/api/users/invite', auth, requireAdmin, ah(async (req, res) => {
  const { email, role, password } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  const existing = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) return res.status(409).json({ error: 'user already exists' });
  const finalPassword = (password && password.length >= 6) ? password : Math.random().toString(36).slice(-10);
  const hash = bcrypt.hashSync(finalPassword, 10);
  const id = uuidv4();
  await db.run(`INSERT INTO users (id, email, password_hash, full_name, display_name, role, created_date, updated_date)
    VALUES (?, ?, ?, '', '', ?, ?, ?)`,
    [id, email.toLowerCase(), hash, role || 'client', now(), now()]);
  res.json({ ok: true, email: email.toLowerCase(), temp_password: finalPassword, role: role || 'client' });
}));

// Set/reset a user's password (admin only)
app.post('/api/users/:id/set-password', auth, requireAdmin, ah(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' });
  const target = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!target) return res.status(404).json({ error: 'user not found' });
  const hash = bcrypt.hashSync(password, 10);
  await db.run('UPDATE users SET password_hash = ?, updated_date = ? WHERE id = ?', [hash, now(), req.params.id]);
  res.json({ ok: true, email: target.email });
}));

// updateUserName function - mirrors base44 function
app.post('/api/functions/updateUserName', auth, requireAdmin, ah(async (req, res) => {
  const { userId, display_name } = req.body;
  await db.run('UPDATE users SET display_name = ?, updated_date = ? WHERE id = ?', [display_name, now(), userId]);
  const targetUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  if (targetUser) {
    const orders = await db.all('SELECT * FROM orders WHERE client_email = ?', [targetUser.email]);
    for (const o of orders) {
      await db.run('UPDATE orders SET client_name = ?, updated_date = ? WHERE id = ?', [display_name, now(), o.id]);
    }
  }
  res.json({ ok: true });
}));

// ---------- Generic entity CRUD ----------

const ENTITY_TABLES = {
  Product: 'products',
  Order: 'orders',
  User: 'users',
  SpecialClient: 'special_clients',
  SpecialClientProduct: 'special_client_products',
};

const JSON_FIELDS = {
  orders: ['items'],
};

function serializeRow(table, row) {
  if (!row) return row;
  const out = { ...row };
  if (table === 'users') {
    delete out.password_hash;
    out.full_name = out.display_name || out.full_name;
  }
  if (table === 'products') {
    out.is_active = !!out.is_active;
    out.price_on_request = !!out.price_on_request;
  }
  (JSON_FIELDS[table] || []).forEach(f => {
    if (out[f]) {
      try { out[f] = JSON.parse(out[f]); } catch (e) { /* leave as-is */ }
    }
  });
  return out;
}

function deserializeBody(table, body) {
  const out = { ...body };
  (JSON_FIELDS[table] || []).forEach(f => {
    if (f in out && typeof out[f] !== 'string') {
      out[f] = JSON.stringify(out[f]);
    }
  });
  if (table === 'products' && 'is_active' in out) {
    out.is_active = out.is_active ? 1 : 0;
  }
  if (table === 'products' && 'price_on_request' in out) {
    out.price_on_request = out.price_on_request ? 1 : 0;
  }
  return out;
}

function getTable(entityName, res) {
  const table = ENTITY_TABLES[entityName];
  if (!table) {
    res.status(404).json({ error: 'unknown entity' });
    return null;
  }
  return table;
}

// List / filter: GET /api/entities/:entity?sort=-created_date&limit=200&filter={"status":"pending"}
app.get('/api/entities/:entity', auth, ah(async (req, res) => {
  const table = getTable(req.params.entity, res);
  if (!table) return;
  let sql = `SELECT * FROM ${table}`;
  const params = [];
  if (req.query.filter) {
    let filterObj = {};
    try { filterObj = JSON.parse(req.query.filter); } catch (e) {}
    const keys = Object.keys(filterObj);
    if (keys.length) {
      sql += ' WHERE ' + keys.map(k => `${k} = ?`).join(' AND ');
      keys.forEach(k => params.push(filterObj[k]));
    }
  }
  let sort = req.query.sort || '';
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    sql += ` ORDER BY ${col} ${desc ? 'DESC' : 'ASC'}`;
  } else {
    sql += ' ORDER BY created_date DESC';
  }
  if (req.query.limit) {
    sql += ` LIMIT ${parseInt(req.query.limit, 10)}`;
  }
  const rows = await db.all(sql, params);
  res.json(rows.map(r => serializeRow(table, r)));
}));

app.post('/api/entities/:entity', auth, ah(async (req, res) => {
  const table = getTable(req.params.entity, res);
  if (!table) return;
  const body = deserializeBody(table, req.body || {});
  const id = uuidv4();
  const cols = Object.keys(body);
  const allCols = ['id', ...cols, 'created_date', 'updated_date'];
  const placeholders = allCols.map(() => '?').join(', ');
  const values = [id, ...cols.map(c => body[c]), now(), now()];
  await db.run(`INSERT INTO ${table} (${allCols.join(', ')}) VALUES (${placeholders})`, values);
  const row = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  res.json(serializeRow(table, row));
}));

app.put('/api/entities/:entity/:id', auth, ah(async (req, res) => {
  const table = getTable(req.params.entity, res);
  if (!table) return;
  const body = deserializeBody(table, req.body || {});
  const cols = Object.keys(body);
  if (cols.length) {
    const setSql = cols.map(c => `${c} = ?`).join(', ') + ', updated_date = ?';
    const values = [...cols.map(c => body[c]), now(), req.params.id];
    await db.run(`UPDATE ${table} SET ${setSql} WHERE id = ?`, values);
  }
  const row = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
  res.json(serializeRow(table, row));
}));

app.delete('/api/entities/:entity/:id', auth, ah(async (req, res) => {
  const table = getTable(req.params.entity, res);
  if (!table) return;
  await db.run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
}));

// Public: list active products without auth (storefront) & create guest orders
app.get('/api/public/products', ah(async (req, res) => {
  const rows = await db.all('SELECT * FROM products ORDER BY sort_order ASC');
  res.json(rows.map(r => serializeRow('products', r)));
}));

app.post('/api/public/orders', ah(async (req, res) => {
  const body = deserializeBody('orders', req.body || {});
  const id = uuidv4();
  const cols = Object.keys(body);
  const allCols = ['id', ...cols, 'status', 'created_date', 'updated_date'];
  const placeholders = allCols.map(() => '?').join(', ');
  const values = [id, ...cols.map(c => body[c]), 'pending', now(), now()];
  await db.run(`INSERT INTO orders (${allCols.join(', ')}) VALUES (${placeholders})`, values);
  const row = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
  res.json(serializeRow('orders', row));
}));

// Public: lightweight order status lookup for post-checkout tracking (no auth, no sensitive fields)
app.get('/api/public/orders/:id', ah(async (req, res) => {
  const row = await db.get(
    'SELECT id, status, delivery_date, driver_name, total_amount, created_date FROM orders WHERE id = ?',
    [req.params.id]
  );
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(serializeRow('orders', row));
}));

app.get('/api/health', (req, res) => res.json({ ok: true, time: now() }));

// Fallback error handler for any unexpected async errors.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

async function start() {
  await db.init();
  app.listen(PORT, () => console.log(`Natural Ice backend listening on :${PORT}`));
}

start().catch((err) => {
  console.error('FATAL: failed to start server', err);
  process.exit(1);
});
