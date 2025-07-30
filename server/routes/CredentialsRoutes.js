const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const auth = require('../middleware/auth');

// List credentials for a division
router.get('/credentials/:divisionId', auth, credentialController.getCredentials);

// Add a credential to a division
router.post('/credentials/:divisionId', auth, credentialController.addCredential);

// Update a credential in a division
router.put('/credentials/:divisionId/:credentialId', auth, credentialController.updateCredential);

module.exports = router;