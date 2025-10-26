const express = require("express");
const router = express.Router();
const formController = require("../controllers/form.submit.controller");

// POST /api/v1/submit
router.post("/submit", formController.submitForm);

module.exports = router;
