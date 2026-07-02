const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'naturalice-dev-secret-change-me';
const now = () => new Date().toISOString();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ---------- Helpers ----------

function rowToUser(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return { ...rest, full_name: rest.display_name || rest.full_name, email: rest.email };
}

function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
}

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
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

app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'user already exists' });
  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare(`INSERT INTO users (id, email, password_hash, full_name, display_name, role, created_date, updated_date)
    VALUES (?, ?, ?, ?, ?, 'client', ?, ?)`)
    .run(id, email.toLowerCase(), hash, full_name || '', full_name || '', now(), now());
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = sign(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000 });
  res.json(rowToUser(user));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = sign(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000 });
  res.json(rowToUser(user));
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json(rowToUser(req.user));
});

app.put('/api/auth/me', auth, (req, res) => {
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
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json(rowToUser(user));
});

// Invite user (admin only) - creates account with a chosen or generated password
app.post('/api/users/invite', auth, requireAdmin, (req, res) => {
  const { email, role, password } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'user already exists' });
  const finalPassword = (password && password.length >= 6) ? password : Math.random().toString(36).slice(-10);
  const hash = bcrypt.hashSync(finalPassword, 10);
  const id = uuidv4();
  db.prepare(`INSERT INTO users (id, email, password_hash, full_name, display_name, role, created_date, updated_date)
    VALUES (?, ?, ?, '', '', ?, ?, ?)`)
    .run(id, email.toLowerCase(), hash, role || 'client', now(), now());
  res.json({ ok: true, email: email.toLowerCase(), temp_password: finalPassword, role: role || 'client' });
});

// Set/reset a user's password (admin only)
app.post('/api/users/:id/set-password', auth, requireAdmin, (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' });
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'user not found' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash = ?, updated_date = ? WHERE id = ?').run(hash, now(), req.params.id);
  res.json({ ok: true, email: target.email });
});

// updateUserName function - mirrors base44 function
app.post('/api/functions/updateUserName', auth, requireAdmin, (req, res) => {
  const { userId, display_name } = req.body;
  db.prepare('UPDATE users SET display_name = ?, updated_date = ? WHERE id = ?').run(display_name, now(), userId);
  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (targetUser) {
    const orders = db.prepare('SELECT * FROM orders WHERE client_email = ?').all(targetUser.email);
    const upd = db.prepare('UPDATE orders SET client_name = ?, updated_date = ? WHERE id = ?');
    orders.forEach(o => upd.run(display_name, now(), o.id));
  }
  res.json({ ok: true });
});

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
app.get('/api/entities/:entity', auth, (req, res) => {
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
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(r => serializeRow(table, r)));
});

app.post('/api/entities/:entity', auth, (req, res) => {
  const table = getTable(req.params.entity, res);
  if (!table) return;
  const body = deserializeBody(table, req.body || {});
  const id = uuidv4();
  const cols = Object.keys(body);
  const allCols = ['id', ...cols, 'created_date', 'updated_date'];
  const placeholders = allCols.map(() => '?').join(', ');
  const values = [id, ...cols.map(c => body[c]), now(), now()];
  db.prepare(`INSERT INTO ${table} (${allCols.join(', ')}) VALUES (${placeholders})`).run(...values);
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  res.json(serializeRow(table, row));
});

app.put('/api/entities/:entity/:id', auth, (req, res) => {
  const table = getTable(req.params.entity, res);
  if (!table) return;
  const body = deserializeBody(table, req.body || {});
  const cols = Object.keys(body);
  if (cols.length) {
    const setSql = cols.map(c => `${c} = ?`).join(', ') + ', updated_date = ?';
    const values = [...cols.map(c => body[c]), now(), req.params.id];
    db.prepare(`UPDATE ${table} SET ${setSql} WHERE id = ?`).run(...values);
  }
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
  res.json(serializeRow(table, row));
});

app.delete('/api/entities/:entity/:id', auth, (req, res) => {
  const table = getTable(req.params.entity, res);
  if (!table) return;
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
  res.json({ ok: true });
});

// Public: list active products without auth (storefront) & create guest orders
app.get('/api/public/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY sort_order ASC').all();
  res.json(rows.map(r => serializeRow('products', r)));
});

app.post('/api/public/orders', (req, res) => {
  const body = deserializeBody('orders', req.body || {});
  const id = uuidv4();
  const cols = Object.keys(body);
  const allCols = ['id', ...cols, 'status', 'created_date', 'updated_date'];
  const placeholders = allCols.map(() => '?').join(', ');
  const values = [id, ...cols.map(c => body[c]), 'pending', now(), now()];
  db.prepare(`INSERT INTO orders (${allCols.join(', ')}) VALUES (${placeholders})`).run(...values);
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.json(serializeRow('orders', row));
});

app.get('/api/health', (req, res) => res.json({ ok: true, time: now() }));

app.listen(PORT, () => console.log(`Natural Ice backend listening on :${PORT}`));
