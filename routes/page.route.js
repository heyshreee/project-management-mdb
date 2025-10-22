const express = require("express");
const path = require("path");

const router = express.Router();

// Helper: resolve public path dynamically
const publicPath = path.join(__dirname, "..", "public");

// ROUTES
router.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

router.get("/admin-login", (req, res) => {
  res.sendFile(path.join(publicPath, "admin.login.html"));
});

router.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(publicPath, "admin.dashboard.html"));
});

// 404 fallback
router.use((req, res) => {
  res.status(404).send("<h1>404 Not Found</h1>");
});

module.exports = router;
