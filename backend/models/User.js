const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  sanitizedEmail: { type: String },
  role: { type: String, enum: ["employee", "manager"], required: true },
  status:{type : String , default:"inactive",enum:["active","inactive"]},
});

module.exports = mongoose.model("User", userSchema, "Users");
