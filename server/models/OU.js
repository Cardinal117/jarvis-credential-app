const mongoose = require('mongoose');

// Organization unit object schema.
const ouSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('OU', ouSchema);