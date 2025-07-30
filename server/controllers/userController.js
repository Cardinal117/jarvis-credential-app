const User = require("../models/User");
const OU = require("../models/OU");
const Division = require("../models/Division");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Register a new user.
exports.register = async (req, res) => {
  try {
    const { username, password, ou, division } = req.body;

    // Pretty print the body.
    console.log("BODY RECEIVED:", JSON.stringify(req.body, null, 2));

    // Validate OU(Organization Unit) if provided.
    let ouIds = [];
    if (ou) {
      if (!mongoose.Types.ObjectId.isValid(ou)) {
        return res.status(400).send({ err: "Invalid OU ID format" });
      }
      const ouDoc = await OU.findById(ou);
      if (!ouDoc) return res.status(404).send({ err: "OU not found" });
      ouIds = [ou];
    }

    // Validate Division if provided.
    let divisionIds = [];
    if (division) {
      if (!mongoose.Types.ObjectId.isValid(division)) {
        return res.status(400).send({ err: "Invalid Division ID format" });
      }
      const divisionDoc = await Division.findById(division);
      if (!divisionDoc)
        return res.status(404).send({ err: "Division not found" });
      divisionIds = [division];
    }

    // Create new user.
    const user = new User({
      username,
      password,
      role: "normal",
      ous: ouIds,
      divisions: divisionIds,
    });
    // Saver new user to collection.
    await user.save();
    const payload = {
      id: user._id,
      username,
      role: user.role,
      divisions: user.divisions,
    };
    // Generate jwt token and set expiry time.
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Send token to be accessed.
    res.status(201).send({ token });
    console.log(`userController: User ${username} registered successfully!`);
  } catch (err) {
    console.error("userController: Failed to register user:", err);
    res.status(400).send({ err: err.message });
  }
};

// Login a user.
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ err: "Incorrect login!" });
    }
    // Create user payload for authentication.
    const payload = {
      id: user._id,
      username,
      role: user.role,
      divisions: user.divisions,
    };
    // Generate jwt token and set expiry time.
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Send token to be accessed.
    res.send({ token });
    console.log(`userController: User ${username} logged in successfully!`);
  } catch (err) {
    console.error("userController: Login failed:", err);
    res.status(400).send({ err: err.message });
  }
};

// Get all users (admin only).
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).send({ err: "Admin access required" });
    const users = await User.find()
      .populate("ous", "name")
      .populate("divisions", "name")
      .select("username role ous divisions");
    res.send(users); // Fetches and sends all users and their data to be accessed.
    console.log("userController: Users fetched successfully!");
  } catch (err) {
    console.error("userController: Failed to fetch users:", err);
    res.status(400).send({ err: err.message });
  }
};

// Assign user to OU/Division (admin only).
exports.assignUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ err: "Admins only" });
    }
    const { userId } = req.params;
    const { ou, division } = req.body;

    // Validate inputs
    if (!userId || (!ou && !division)) {
      return res
        .status(400)
        .json({ err: "User ID and at least one OU or division required" });
    }

    // Find user by id.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }

    // Add new OU if provided.
    if (ou) {
      const ouDoc = await OU.findById(ou);
      if (!ouDoc) {
        return res.status(404).json({ err: "OU not found" });
      }
      if (!user.ous.includes(ou)) {
        user.ous.push(ou);
      }
    }

    // Add new Division if provided.
    if (division) {
      const divDoc = await Division.findById(division);
      if (!divDoc) {
        return res.status(404).json({ err: "Division not found" });
      }
      if (!user.divisions.includes(division)) {
        user.divisions.push(division);
      }
    }

    // Save and populate user with new data.
    await user.save();
    const updatedUser = await User.findById(userId).populate("ous divisions");
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Assign user error:", err);
    res.status(500).json({ err: "Server error" });
  }
};
// Unassign user to OU/Division (admin only).
exports.unassignUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ err: "Admins only" });
    }
    const { userId } = req.params;
    const { ou, division } = req.body;

    // Check if ou and or division is not empty.
    if (!userId || (!ou && !division)) {
      return res.status(400).json({ err: "User ID and at least one OU or division required" });
    }

    // Find user by id.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }

    // Remove OU if provided.
    if (ou) {
      const ouDoc = await OU.findById(ou);
      if (!ouDoc) {
        return res.status(404).json({ err: "OU not found" });
      }
      user.ous = user.ous.filter((id) => id.toString() !== ou);
    }

    // Remove Division if provided.
    if (division) {
      const divDoc = await Division.findById(division);
      if (!divDoc) {
        return res.status(404).json({ err: "Division not found" });
      }
      user.divisions = user.divisions.filter((id) => id.toString() !== division);
    }

    // Save and populate user with new data. 
    await user.save();
    const updatedUser = await User.findById(userId).populate("ous divisions");
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Unassign user error:", err);
    res.status(500).json({ err: "Server error" });
  }
};

// Change user role (admin only).
exports.changeRole = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).send({ err: "Admin access required" });
    const { role } = req.body;
    // Check if the roles include the enum values of the User model.
    if (!["normal", "management", "admin"].includes(role))
      return res.status(400).send({ err: "Invalid role" });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send({ err: "User not found" });
    user.role = role;
    // Save new user role data and send to be accessed.
    await user.save();
    res.send(user);
    console.log(
      `userController: User ${user.username} role changed to ${role}!`
    );
  } catch (err) {
    console.error("userController: Failed to change role:", err);
    res.status(400).send({ err: err.message });
  }
};

// Gets all OU's.
exports.getAllOUs = async (req, res) => {
  try {
    // Fetch and send all OU's to access.
    const ous = await OU.find().select("name _id");
    res.send(ous);
    console.log("userController: OUs fetched successfully!");
  } catch (err) {
    console.error("userController: Failed to fetch OUs:", err);
    res.status(400).send({ err: err.message });
  }
};

// Gets all Divisions.
exports.getAllDivisions = async (req, res) => {
  try {
    // Fetch and send all Divisions to access.
    const divisions = await Division.find().select("name _id");
    res.send(divisions);
    console.log("userController: Divisions fetched successfully!");
  } catch (err) {
    console.error("userController: Failed to fetch divisions:", err);
    res.status(400).send({ err: err.message });
  }
};
