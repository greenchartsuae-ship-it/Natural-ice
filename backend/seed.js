const db = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const now = () => new Date().toISOString();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'greenchartsuae@gmail.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'NaturalIce2026!';

function categorySlug(cat) {
  return cat.trim().toLowerCase().replace(/\s+/g, '_');
}

function parsePrice(priceText) {
  // e.g. "AED 20/piece"
  const m = priceText.match(/AED\s*([\d.]+)\s*\/\s*(\w+)/i);
  if (!m) return { price: 0, unit: 'piece' };
  let unit = m[2].toLowerCase();
  if (unit === 'pieces') unit = 'piece';
  if (!['kg', 'piece', 'box', 'pack', 'liter'].includes(unit)) unit = 'piece';
  return { price: parseFloat(m[1]), unit };
}

function seedAdmin() {
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(ADMIN_EMAIL);
  if (existing) {
    console.log('Admin already exists:', ADMIN_EMAIL);
    return;
  }
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare(`INSERT INTO users (id, email, password_hash, full_name, display_name, role, created_date, updated_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(uuidv4(), ADMIN_EMAIL, hash, 'Administrator', 'Administrator', 'admin', now(), now());
  console.log('Seeded admin user:', ADMIN_EMAIL, 'password:', ADMIN_PASSWORD);
}

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) c FROM products').get().c;
  if (count > 0) {
    console.log('Products already seeded:', count);
    return;
  }
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed_products.json'), 'utf-8'));
  const insert = db.prepare(`INSERT INTO products
    (id, name, description, category, price, unit, image_url, is_active, sort_order, min_order_quantity, created_date, updated_date)
    VALUES (@id, @name, @description, @category, @price, @unit, @image_url, 1, @sort_order, 1, @created_date, @updated_date)`);
  const insertMany = db.transaction((items) => {
    items.forEach((p, i) => {
      const { price, unit } = parsePrice(p.price_text);
      insert.run({
        id: uuidv4(),
        name: p.name.trim(),
        description: p.description || '',
        category: categorySlug(p.category),
        price,
        unit,
        image_url: p.image_url,
        sort_order: i,
        created_date: now(),
        updated_date: now(),
      });
    });
  });
  insertMany(raw);
  console.log('Seeded', raw.length, 'products');
}

seedAdmin();
seedProducts();
