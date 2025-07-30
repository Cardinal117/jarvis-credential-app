const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const ouController = require("../controllers/ouController");
const divisionController = require("../controllers/divisionController");
const auth = require("../middleware/auth");

// Register a new user.
router.post("/register", userController.register);

// Login a user.
router.post("/login", userController.login);

// List all users (admin only).
router.get("/users", auth, userController.getAllUsers);

// Assign user to OU/Division (admin only).
router.put("/users/:userId/assign", auth, userController.assignUser);

// Unassign user to OU/Division (admin only).
router.patch("/users/:userId/unassign", auth, userController.unassignUser);

// Change user role (admin only).
router.put("/users/:userId/role", auth, userController.changeRole);

// Get all ou's and divisions for admin panel (admin only).
router.get("/ous", auth, ouController.getOUs);
router.get("/divisions", auth, divisionController.getDivisions);

// Get ou's and divisions for registration page selection options.
router.get("/ous-register", userController.getAllOUs);
router.get("/divisions-register", userController.getAllDivisions);

module.exports = router;
