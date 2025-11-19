const express = require("express");
const YieldHistory = require("../models/yield_history");
const { predictYield } = require("../utils/predictYield");

const router = express.Router();

router.get("/:plotId", async (req, res) => {
  try {
    const plotId = req.params.plotId;

    const history = await YieldHistory.findAll({
      where: { plot_id: plotId },
      order: [["year", "ASC"]],
    });

    if (history.length < 2) {
      return res.json({
        ok: false,
        predictedYieldKg: null,
        message: "ต้องมีข้อมูลย้อนหลังอย่างน้อย 2 ปีเพื่อพยากรณ์",
      });
    }

    const predictedYieldKg = predictYield(history);

    return res.json({
      ok: true,
      predictedYieldKg,
      history
    });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
