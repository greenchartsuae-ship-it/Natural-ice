const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'naturalice.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'client',
  created_date TEXT,
  updated_date TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  category TEXT,
  price REAL,
  unit TEXT,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  created_date TEXT,
  updated_date TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  client_email TEXT,
  client_name TEXT,
  status TEXT DEFAULT 'pending',
  items TEXT,
  total_amount REAL,
  delivery_address TEXT,
  delivery_phone TEXT,
  delivery_lat REAL,
  delivery_lng REAL,
  notes TEXT,
  assigned_driver TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  driver_location_lat REAL,
  driver_location_lng REAL,
  delivery_date TEXT,
  approved_at TEXT,
  preparing_at TEXT,
  ready_at TEXT,
  collected_at TEXT,
  on_the_way_at TEXT,
  delivered_at TEXT,
  created_date TEXT,
  updated_date TEXT
);

CREATE TABLE IF NOT EXISTS special_clients (
  id TEXT PRIMARY KEY,
  client_email TEXT,
  trn TEXT,
  company_name TEXT,
  created_date TEXT,
  updated_date TEXT
);

CREATE TABLE IF NOT EXISTS special_client_products (
  id TEXT PRIMARY KEY,
  client_email TEXT,
  product_id TEXT,
  special_price REAL,
  created_date TEXT,
  updated_date TEXT
);
`);

// ---------- Lightweight migrations for columns added after initial release ----------
// (SQLite has no "ADD COLUMN IF NOT EXISTS", so we check PRAGMA table_info first.)
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
ensureColumn('products', 'price_on_request', 'INTEGER DEFAULT 0');
ensureColumn('orders', 'delivery_fee', 'REAL DEFAULT 0');

module.exports = db;
