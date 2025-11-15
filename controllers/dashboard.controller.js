const { sequelize } = require('../function/postgre');
const { QueryTypes } = require('sequelize');

exports.getSummary = async (req, res) => {
  try {
    const { user_id } = req.query;

    const rows = await sequelize.query(`
      SELECT 
        COALESCE(SUM(pr.income_total), 0) AS income_total,
        COALESCE(SUM(pr.expense_total), 0) AS expense_total,
        COALESCE(SUM(pr.income_total - pr.expense_total), 0) AS profit_total
      FROM production_rounds pr
      WHERE pr.user_id = :user_id
    `, {
      replacements: { user_id },
      type: QueryTypes.SELECT
    });

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlots = async (req, res) => {
  try {
    const { user_id } = req.query;

    const data = await sequelize.query(`
      SELECT 
        pl.plot_id,
        pl.plot_name,
        p.plant_name,
        COALESCE(SUM(pr.income_total), 0) AS income_total,
        COALESCE(SUM(pr.expense_total), 0) AS expense_total,
        COALESCE(SUM(pr.income_total - pr.expense_total), 0) AS profit
      FROM plots pl
      LEFT JOIN plants p ON pl.plant_id = p.plant_id
      LEFT JOIN production_rounds pr ON pr.plot_id = pl.plot_id
      WHERE pl.user_id = :user_id
      GROUP BY pl.plot_id, pl.plot_name, p.plant_name
      ORDER BY pl.plot_id DESC
    `, {
      replacements: { user_id },
      type: QueryTypes.SELECT
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
