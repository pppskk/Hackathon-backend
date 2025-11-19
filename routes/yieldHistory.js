const express = require("express");
const router = express.Router();
const controller = require("../controllers/yieldHistory.controller");

router.get("/:plotId", controller.getHistoryByPlot);
router.post("/", controller.addHistory);
router.put("/:id", controller.updateHistory);
router.delete("/:id", controller.deleteHistory);

module.exports = router;
