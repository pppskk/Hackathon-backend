const YieldHistory = require("../models/yield_history");

exports.getHistoryByPlot = async (req, res) => {
  try {
    const plotId = req.params.plotId;

    const history = await YieldHistory.findAll({
      where: { plot_id: plotId },
      order: [["year", "ASC"]],
    });

    res.json({ ok: true, history });
  } catch (err) {
    console.log("getHistoryByPlot error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

exports.addHistory = async (req, res) => {
  try {
    const { plot_id, year, yield_kg } = req.body;

    const item = await YieldHistory.create({ plot_id, year, yield_kg });

    res.json({ ok: true, item });
  } catch (err) {
    console.log("addHistory error:", err);
    res.status(500).json({ ok: false });
  }
};

exports.updateHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const { yield_kg } = req.body;

    await YieldHistory.update({ yield_kg }, { where: { id } });

    res.json({ ok: true });
  } catch (err) {
    console.log("updateHistory error:", err);
    res.status(500).json({ ok: false });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    const id = req.params.id;
    await YieldHistory.destroy({ where: { id } });

    res.json({ ok: true });
  } catch (err) {
    console.log("deleteHistory error:", err);
    res.status(500).json({ ok: false });
  }
};
