const mongoose = require('mongoose');

// Division schema, links to the Organization unit and credential repository 
// to connect to each table/collection.
const divisionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  ou: { type: mongoose.Schema.Types.ObjectId, ref: 'OU', required: true },
  credentialRepo: { type: mongoose.Schema.Types.ObjectId, ref: 'CredentialRepo' },
});

module.exports = mongoose.model('Division', divisionSchema);