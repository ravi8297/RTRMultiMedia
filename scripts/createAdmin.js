const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rtr-media";

// Validate required environment variables
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error(
    "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables"
  );
}

// Admin user data from environment (no hardcoded secrets)
const adminData = {
  name: process.env.ADMIN_NAME || "RTR Admin",
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD, // Set this in .env - DO NOT commit to git
  role: "admin",
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const User = require("../models/User").default;
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      console.log(
        "Password not updated. Delete the existing admin first if you want to reset."
      );
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      isVerified: true,
    });

    console.log("Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Password: [REDACTED] — never stored or logged in plaintext");
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();