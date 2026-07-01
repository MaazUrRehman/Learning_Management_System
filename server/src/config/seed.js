import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ROLES, USER_STATUS } from "../constants/permissions.js";

dotenv.config();

/**
 * Seeds the initial Super Admin account.
 *
 * Rules:
 * - Only ONE Super Admin should ever exist in the system.
 * - If a Super Admin already exists, this script does nothing.
 * - Credentials are loaded from environment variables.
 * - Super Admin is created with forcePasswordChange = false (already set manually).
 *
 * Usage: node src/config/seed.js
 */
const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected for seeding...");

    // Check if Super Admin already exists
    const existingSuperAdmin = await User.findOne(
      { role: ROLES.SUPER_ADMIN },
      null,
      { includeDeleted: true } // bypass soft-delete filter
    );

    if (existingSuperAdmin) {
      console.log(
        `ℹ️  Super Admin already exists: ${existingSuperAdmin.email} — skipping seed.`
      );
      await mongoose.disconnect();
      process.exit(0);
    }

    // Load credentials from environment variables
    const superAdminData = {
      username:
        process.env.SUPER_ADMIN_USERNAME || "superadmin",
      email:
        process.env.SUPER_ADMIN_EMAIL || "superadmin@lms.local",
      password:
        process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@2024!",
      firstName: process.env.SUPER_ADMIN_FIRST_NAME || "Super",
      lastName: process.env.SUPER_ADMIN_LAST_NAME || "Admin",
      role: ROLES.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE,
      forcePasswordChange: false, // Super Admin sets their own credentials
    };

    // Validate required fields
    if (!superAdminData.email || !superAdminData.password) {
      throw new Error(
        "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in environment variables."
      );
    }

    // Use the User model (password will be hashed via pre-save hook)
    const superAdmin = await User.create(superAdminData);

    console.log("🚀 Super Admin seeded successfully!");
    console.log(`   ├── Name     : ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`   ├── Username : ${superAdmin.username}`);
    console.log(`   ├── Email    : ${superAdmin.email}`);
    console.log(`   └── Role     : ${superAdmin.role}`);
    console.log(
      "\n⚠️  Please change the default Super Admin password immediately if using defaults."
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedSuperAdmin();
