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
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { user_id, plant_id, plot_name, area_size } = req.body;

    if (!user_id || !plant_id || !plot_name) {
      return res.status(400).json({
        error: "Missing required fields: user_id, plant_id, plot_name"
      });
    }

    const newPlot = await Plot.create({
      user_id,
      plant_id,
      plot_name,
      area_size
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
