const express = require("express");
const router = express.Router();

router.use("/v1", require('./v1/app.controller.js'));

module.exports = router;