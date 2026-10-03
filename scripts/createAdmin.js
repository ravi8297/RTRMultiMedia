const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rtr-media";

// Admin user data
const adminData = {
  name: "RTR Admin",
  email: "admin@rtrmedia.com",
  password: "admin123", // Change this in production!
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
      console.log("Password not updated. Delete the existing admin first if you want to reset.");
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
    console.log("Password: admin123 (change this immediately!)");
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();