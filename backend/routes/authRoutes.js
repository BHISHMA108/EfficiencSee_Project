const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { sanitizeEmail } = require("../server");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * 🔐 Post-Firebase Signup Initialization
 * Firebase handles authentication
 * This route initializes DB data & role
 */
router.post("/signup", verifyFirebaseToken, async (req, res) => {
  try {
    const { name, role } = req.body;
    console.log("this is the req.body",req.body);
    const firebaseUid = req.firebaseUser.uid;

    if (!name || !role || !email) {
      return res.status(400).json({ message: "Name and role are required." });
    }

    const sanitizedEmail = sanitizeEmail(email);
    console.log(`📝 Signup Init → ${email} → ${sanitizedEmail}`);

    // Prevent duplicate DB users
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Save user profile & role
    const newUser = new User({
      firebaseUid,
      role: role.toLowerCase(),
    });

    await newUser.save();

    // Create employee-specific collection
    if (role.toLowerCase() === "employee") {
      const dynamicSchema = new mongoose.Schema({}, { strict: false });

      const DynamicModel = mongoose.model(
        sanitizedEmail, // model name
        dynamicSchema, // schema
        sanitizedEmail // collection name
      );

      await DynamicModel.create({
        message: "New Employee Data Collection Created",
        createdAt: new Date(),
      });

      console.log(`📂 Collection created: ${sanitizedEmail}`);
    }

    res.status(201).json({
      message: "User initialized successfully",
      email,
      role,
      firebaseUid,
      sanitizedEmail,
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
