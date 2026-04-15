// scripts/seed-admin.js
// Run: node scripts/seed-admin.js
// ⚠️  Lancez ça une seule fois au démarrage du projet

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../src/models/user.model');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB...');

  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log('Admin déjà existe — rien à faire.');
    process.exit(0);
  }

  await User.create({
    name:     process.env.ADMIN_NAME     || 'Admin',
    email:    process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role:     'admin',
  });

  console.log(`✅ Admin créé: ${process.env.ADMIN_EMAIL}`);
  process.exit(0);
};

seedAdmin().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});