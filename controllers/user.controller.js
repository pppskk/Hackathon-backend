const User = require('../models/users');

// CREATE user
exports.createUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Missing request body" });
    }

    const { firstName, lastName, phone, userPicture } = req.body;

    // Validate
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Check duplicate phone
    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: "Phone number already exists" });
    }

    const user = await User.create({ firstName, lastName, phone, userPicture });

    res.status(201).json(user);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


