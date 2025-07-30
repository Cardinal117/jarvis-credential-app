const Division = require("../models/Division");
const CredentialRepo = require("../models/CredentialRepo");

// Get credentials for a division.
exports.getCredentials = async (req, res) => {
  try {
    // Fetch division model.
    const division = await Division.findById(req.params.divisionId).populate(
      "credentialRepo"
    );
    if (!division) return res.status(404).send({ err: "Division not found" });
    if (
      req.user.role === "admin" ||
      req.user.divisions.includes(req.params.divisionId)
    ) {
      // Allow admin user roles to have access to all divisions.
      res.send(division.credentialRepo || { credentials: [] });
      console.log(
        `credentialController: Credentials fetched for division ${req.params.divisionId}`
      );
    } else {
      res.status(403).send({ err: "No access to this division’s credentials" });
    }
  } catch (err) {
    console.error("credentialController: Failed to fetch credentials:", err);
    res.status(400).send({ err: err.message });
  }
};

// Add a credential to a division.
exports.addCredential = async (req, res) => {
  try {
    // Fetch division model.
    const division = await Division.findById(req.params.divisionId).populate(
      "credentialRepo"
    );
    if (!division) return res.status(404).send({ err: "Division not found" });
    if (
      req.user.role === "admin" ||
      req.user.divisions.includes(req.params.divisionId)
    ) {
      // Allow admin users to bypass checks and add a credential.
      const { key, value } = req.body;
      if (!key || !value)
        return res.status(400).send({ err: "Key and value required" });
      let repo = division.credentialRepo;
      if (!repo) {
        repo = new CredentialRepo({
          name: `${division.name}Repo`,
          credentials: [],
        });
        // Save new values to the division and credentialRepo.
        await repo.save();
        division.credentialRepo = repo._id;
        await division.save();
      }
      repo.credentials.push({ key, value });
      await repo.save();
      res.status(201).send(repo);
      console.log(
        `credentialController: Credential added to division ${req.params.divisionId}`
      );
    } else {
      res.status(403).send({ err: "No access to add credentials" });
    }
  } catch (err) {
    console.error("credentialController: Failed to add credential:", err);
    res.status(400).send({ err: err.message });
  }
};

// Update a credential in a division.
exports.updateCredential = async (req, res) => {
  try {
    // Fetch division model.
    const division = await Division.findById(req.params.divisionId).populate(
      "credentialRepo"
    );
    if (!division) return res.status(404).send({ err: "Division not found" });
    if (
      req.user.role === "admin" ||
      (req.user.role === "management" &&
        req.user.divisions.includes(req.params.divisionId))
    ) {
      // Only allow admin and management to edit credentials.
      const repo = division.credentialRepo;
      if (!repo)
        return res.status(404).send({ err: "No credential repo found" });
      const credential = repo.credentials.id(req.params.credentialId);
      if (!credential)
        return res.status(404).send({ err: "Credential not found" });
      credential.key = req.body.key || credential.key;
      credential.value = req.body.value || credential.value;
      // Save new values and send updated credential data.
      await repo.save();
      res.send(repo);
      console.log(
        `credentialController: Credential ${req.params.credentialId} updated in division ${req.params.divisionId}`
      );
    } else {
      res.status(403).send({ err: "No access to update credentials" });
    }
  } catch (err) {
    console.error("credentialController: Failed to update credential:", err);
    res.status(400).send({ err: err.message });
  }
};
