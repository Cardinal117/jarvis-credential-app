const Division = require("../models/Division");

exports.getDivisions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ err: "Admins only" });
    }
    const divisions = await Division.find();
    res.status(200).json(divisions);
  } catch (err) {
    console.error("Get divisions error:", err);
    res.status(500).json({ err: "Server error" });
  }
};