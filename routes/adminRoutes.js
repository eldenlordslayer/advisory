const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user_model");
const Listing = require("../model/listing");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Login
router.get("/login", async (req, res) => {
  const { email, password } = req.query;
  try {
    const user = await User.findOne({ email });
    if (!user || user.role_type !== "a") {
      return res.status(403).json({ message: "Access denied." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign(
      { id: user._id, role: user.role_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: 200,
      message: "Logged in",
      result: {
        user_id: user._id,
        access_token: token,
        token_type: "Bearer",
        role_type: user.role_type,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Listing
router.post("/listings", verifyToken, isAdmin, async (req, res) => {
  try {
    const user_id = req.user.id;
    const listing = await Listing.create({ ...req.body, user_id });
    res
      .status(201)
      .json({ status: 201, message: "Listing created", result: listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Listing
router.put("/listings/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Listing
router.delete("/listings/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Listing deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/listings", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find(); // Should return an array
    res.status(200).json({
      result: listings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
