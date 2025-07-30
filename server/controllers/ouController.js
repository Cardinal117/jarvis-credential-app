const OU = require("../models/OU");

exports.getOUs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ err: "Admins only" });
    }
    const ous = await OU.find();
    res.status(200).json(ous);
  } catch (err) {
    console.error("Get OUs error:", err);
    res.status(500).json({ err: "Server error" });
  }
};