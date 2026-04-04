/**
 * Admin Seeder — Creates a default Admin user if none exists.
 *
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const { ROLES } = require('../config/constants');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create default admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@tms.com',
      password: 'admin123', // Change in production!
      role: ROLES.ADMIN,
      phone: '9999999999',
    });

    console.log('✅ Default Admin created successfully');
    console.log('   Email:    admin@tms.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
