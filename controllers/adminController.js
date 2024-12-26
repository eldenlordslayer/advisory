const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./model/user_model");
const Listing = require("./model/listing");
const { isAdmin } = require("./model/user_model");

const router = express.Router();

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login Attempt:", { email, password }); // Debug

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    console.log("Found User:", user); // Debug

    if (!user) {
      console.log("User not found.");
      return res.status(404).json({ message: "User not found." });
    }

    // Check the role
    console.log("User Role Type:", user.role_type); // Debug
    if (user.role_type !== "a") {
      console.log("Access Denied due to Role:", user.role_type); // Debug
      return res.status(403).json({ message: "Access denied." });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch); // Debug

    if (!isMatch) {
      console.log("Invalid password.");
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Token Generated:", token); // Debug

    // Store token and redirect
    res.cookie("token", token, { httpOnly: true });
    console.log("Login Success - Redirecting");
    res.redirect("/listing");
  } catch (error) {
    console.error("Error during login:", error); // Debug
    res.status(500).json({ message: error.message });
  }
});
