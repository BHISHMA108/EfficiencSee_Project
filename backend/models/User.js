const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firebaseUid: { type: String, required: true, unique: true},
  role: { type: String, enum: ["employee", "manager"], required: true }, // Role added
});

module.exports = mongoose.model("Users", userSchema);
