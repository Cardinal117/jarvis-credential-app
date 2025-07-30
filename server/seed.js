const mongoose = require('mongoose');
const User = require('./models/User');
const OU = require('./models/OU');
const Division = require('./models/Division');
const CredentialRepo = require('./models/CredentialRepo');
require('dotenv').config();

// Clears all existing data from the database and assigns new 
// data, also logs the new data sign in info.
// To run call node seed.js in \server
async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing data from the database.
    await User.deleteMany({});
    await OU.deleteMany({});
    await Division.deleteMany({});
    await CredentialRepo.deleteMany({});

    // Create new OUs.
    const ous = await OU.create([
      { name: 'News Management' },
      { name: 'Software Reviews' },
      { name: 'Hardware Reviews' },
      { name: 'Opinion Publishing' },
      { name: 'IT Operations' },
    ]);

    // Create new Credential Repos.
    const newsRepo = await CredentialRepo.create({
      name: 'NewsRepo',
      credentials: [
        { key: 'wp_admin', value: 'news_jarvis_rules' },
        { key: 'db_pass', value: 'news_mrk47' },
      ],
    });
    const softwareRepo = await CredentialRepo.create({
      name: 'SoftwareRepo',
      credentials: [
        { key: 'server_key', value: 'soft_lock_ultron' },
        { key: 'api_key', value: 'api_soft_remove_ultron' },
      ],
    });

    // Create new Divisions.
    const divisions = await Division.create([
      { name: 'NewsFinance', ou: ous[0]._id, credentialRepo: newsRepo._id },
      { name: 'SoftwareIT', ou: ous[1]._id, credentialRepo: softwareRepo._id },
      { name: 'HardwareDev', ou: ous[2]._id },
    ]);

    // Create new Users.
    const users = await User.create([
      { username: 'Ultron', password: 'extinction101', role: 'normal', ous: [ous[0]._id], divisions: [divisions[0]._id] },
      { username: 'PeterParker', password: 'spidermanNY', role: 'management', ous: [ous[1]._id], divisions: [divisions[1]._id] },
      { username: 'TonyStark', password: 'ironman456', role: 'admin', ous: [ous[2]._id, ous[4]._id], divisions: [divisions[2]._id] },
    ]);

    // Log new seeded data.
    console.log('Database seeded successfully');
    console.log('OUs:', ous.map(ou => ({ name: ou.name, _id: ou._id.toString() })));
    console.log('Divisions:', divisions.map(div => ({ name: div.name, _id: div._id.toString() })));
    console.log('CredentialRepos:', [newsRepo, softwareRepo].map(repo => ({ name: repo.name, _id: repo._id.toString() })));
    console.log('Users:', users.map(user => ({ username: user.username, password: "See \server\seed.js", _id: user._id.toString() })));

    // Close connection to the db.
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
  }
}

seedData();