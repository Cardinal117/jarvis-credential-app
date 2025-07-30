const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User schema.
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["normal", "management", "admin"],
    default: "normal",
  },
  ous: [{ type: mongoose.Schema.Types.ObjectId, ref: "OU" }],
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division" }],
});

// Password hashing for neat security.
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Comparison method to check if passwords match.
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);