const express = require("express");
const router = express.Router();

const { URLS: { API_URL, VERIFY_URL }} = require("../config/config");


router.get("/", (req, res) => {
  res.json({
    API_URL: API_URL,
    VERIFY_URL: VERIFY_URL,
  });
});

module.exports = router;