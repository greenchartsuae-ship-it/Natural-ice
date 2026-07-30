const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

// DATABASE_URL should be the connection string exactly as copied from the
// Neon console (includes sslmode=require&channel_binding=require), which
// pg's connection-string parser handles correctly out of the box.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Convert SQLite-style "?" placeholders (used throughout the app) to
// Postgres-style "$1, $2, ..." placeholders.
function toPgSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function run(sql, params = []) {
  return pool.query(toPgSql(sql), params);
}

async function get(sql, params = []) {
  const res = await pool.query(toPgSql(sql), params);
  return res.rows[0];
}

async function all(sql, params = []) {
  const res = await pool.query(toPgSql(sql), params);
  return res.rows;
}

async function init() {
  await pool.query(`
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

  // Lightweight migrations for columns added after initial release.
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_on_request INTEGER DEFAULT 0`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee REAL DEFAULT 0`);
}

module.exports = { pool, run, get, all, init };
