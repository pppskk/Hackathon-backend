const { sequelize } = require('../function/postgre');
const { QueryTypes } = require('sequelize');
const Plot = require('../models/plots');  

exports.getPlots = async (req, res) => {
  try {
    const { user_id } = req.query;

    const plots = await sequelize.query(`
      SELECT 
        pl.plot_id,
        pl.plot_name,
        pl.area_size,
        p.plant_name,
        pl.plant_id
      FROM plots pl
      LEFT JOIN plants p ON p.plant_id = pl.plant_id
      WHERE pl.user_id = :user_id
      ORDER BY pl.plot_id DESC
    `, {
      replacements: { user_id },
      type: QueryTypes.SELECT
    });

    res.json(plots);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlotById = async (req, res) => {
  try {
    const { plot_id } = req.params;

    const plot = await sequelize.query(`
      SELECT 
        pl.plot_id,
        pl.plot_name,
        pl.area_size,
   	    pl.plant_id,
        p.plant_name
      FROM plots pl
      LEFT JOIN plants p ON p.plant_id = pl.plant_id
      WHERE pl.plot_id = :plot_id
    `, {
      replacements: { plot_id },
      type: QueryTypes.SELECT
    });

    if (!plot.length) return res.status(404).json({ error: "Plot not found" });

    res.json(plot[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.createPlot = async (req, res) => {
  try {
    const { user_id, plot_name, area_size, plant_id, plant_name } = req.body;

    if (!user_id || !plot_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let finalPlantId = plant_id;

    // ถ้ามีการกรอกชื่อพืชใหม่ ให้สร้าง plant ใหม่ก่อน
    if (!plant_id && plant_name) {
      const newPlant = await sequelize.query(
        `
          INSERT INTO plants (plant_name)
          VALUES (:plant_name)
          RETURNING plant_id;
        `,
        {
          replacements: { plant_name },
          type: QueryTypes.SELECT
        }
      );
      finalPlantId = newPlant[0].plant_id;
    }

    // บันทึก plot ใหม่
    const newPlot = await Plot.create({
      user_id,
      plot_name,
      area_size,
      plant_id: finalPlantId
    });

    res.status(201).json(newPlot);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlot = async (req, res) => {
  try {
    const plot = await Plot.findByPk(req.params.id);
    if (!plot) return res.status(404).json({ error: "Plot not found" });

    plot.plot_name = req.body.plot_name ?? plot.plot_name;
    plot.area_size = req.body.area_size ?? plot.area_size;
    plot.plant_id  = req.body.plant_id ?? plot.plant_id;

    await plot.save();
    res.json(plot);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePlot = async (req, res) => {
  try {
    const plot = await Plot.findByPk(req.params.id);
    if (!plot) return res.status(404).json({ error: "Plot not found" });

    await plot.destroy();
    res.json({ message: "Plot deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// 1) SUMMARY — ยอดรวมค่าใช้จ่ายทั้งหมดของแปลง
// =========================
exports.getExpenseSummary = async (req, res) => {
  try {
    const { plot_id } = req.params;

    const result = await sequelize.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) END), 0) AS total_expense
      FROM transactions
      WHERE plot_id = :plot_id
    `, {
      replacements: { plot_id },
      type: QueryTypes.SELECT
    });

    res.json(result[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =========================
// 2) BREAKDOWN — ค่าใช้จ่ายแยกตามหมวดหมู่
// =========================
exports.getExpenseBreakdown = async (req, res) => {
  try {
    const { plot_id } = req.params;

    const items = await sequelize.query(`
      SELECT 
        c.category_name AS name,
        ABS(SUM(t.amount)) AS amount
      FROM transactions t
      LEFT JOIN categories c ON c.category_id = t.category_id
      WHERE t.plot_id = :plot_id AND t.amount < 0
      GROUP BY c.category_name
      ORDER BY amount DESC
    `, {
      replacements: { plot_id },
      type: QueryTypes.SELECT
    });

    // คำนวณ % รวมจากยอดทั้งหมด
    const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

    const result = items.map(item => ({
      name: item.name,
      amount: Number(item.amount),
      percentage: total === 0 ? 0 : ((item.amount / total) * 100).toFixed(0)
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

