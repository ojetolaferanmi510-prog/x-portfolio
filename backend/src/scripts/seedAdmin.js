/**
 * Create or update the single admin user from env.
 * Usage: npm run seed:admin
 * Requires: MONGODB_URI, ADMIN_USER, ADMIN_PASS
 */
require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function main() {
  const uri = process.env.MONGODB_URI;
  const username = String(process.env.ADMIN_USER || '')
    .trim()
    .toLowerCase();
  const password = String(process.env.ADMIN_PASS || '');

  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }
  if (!username || !password) {
    console.error('ADMIN_USER and ADMIN_PASS are required');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('ADMIN_PASS must be at least 8 characters');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await Admin.findOneAndUpdate(
    { username },
    { username, passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${admin.username} (${admin._id})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
