require("dotenv").config();
const express = require("express");
const connectDB = require("./model/db");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("view"));
app.use(express.static("public"));

app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "login.html"));
});

app.get("/listings", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "listings.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
