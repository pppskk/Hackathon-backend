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

exports.getPlotSummary = async (req, res) => {
  try {
    const { plot_id, user_id } = req.query;

    if (!plot_id && !user_id) {
      return res.status(400).json({ error: "plot_id หรือ user_id อย่างใดอย่างหนึ่งต้องมี" });
    }

    let whereClause = "";
    let params = {};

    if (plot_id) {
      whereClause = "WHERE pr.plot_id = :plot_id";
      params.plot_id = plot_id;
    } else if (user_id) {
      whereClause = "WHERE pr.user_id = :user_id";
      params.user_id = user_id;
    }

    const rows = await sequelize.query(`
      SELECT 
        pl.plot_id,
        pl.plot_name,
        COALESCE(SUM(pr.income_total), 0) AS income_total,
        COALESCE(SUM(pr.expense_total), 0) AS expense_total,
        COALESCE(SUM(pr.income_total - pr.expense_total), 0) AS profit_total
      FROM plots pl
      LEFT JOIN production_rounds pr ON pl.plot_id = pr.plot_id
      ${whereClause}
      GROUP BY pl.plot_id, pl.plot_name
      ORDER BY pl.plot_id ASC
    `, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlotExpenseDetail = async (req, res) => {
  try {
    const { plot_id } = req.params; 

    if (!plot_id || plot_id === 'undefined') {
      return res.status(400).json({ 
        error: 'plot_id is required and must be valid' 
      });
    }

    const rows = await sequelize.query(`
      SELECT 
        tc.name AS name,
        COALESCE(SUM(ABS(t.amount)), 0) AS amount
      FROM transactions t
      LEFT JOIN production_rounds pr ON pr.round_id = t.round_id
      LEFT JOIN transaction_categories tc ON tc.id = t.category_id
      WHERE pr.plot_id = :plot_id
        AND t.amount < 0
      GROUP BY tc.name
      ORDER BY amount DESC
    `, {
      replacements: { plot_id },
      type: QueryTypes.SELECT
    });

    const totalExpense = rows.reduce((sum, row) => sum + Number(row.amount), 0);

    const details = rows.map(row => ({
      name: row.name,
      amount: Number(row.amount),
      percentage: totalExpense > 0 
        ? ((Number(row.amount) / totalExpense) * 100).toFixed(1)
        : 0
    }));

    res.json({
      plot_id,
      total_expense: totalExpense,
      details
    });

  } catch (err) {
    console.error('Error in getPlotExpenseDetail:', err);
    res.status(500).json({ error: 'Failed to get expense detail' });
  }
};

// 1. Expense By Plant
exports.getExpenseByPlant = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const rows = await sequelize.query(
      `
      SELECT 
        p.plant_name,
        COALESCE(SUM(ABS(t.amount)), 0) AS amount
      FROM transactions t
      LEFT JOIN production_rounds pr ON pr.round_id = t.round_id
      LEFT JOIN plots pl ON pl.plot_id = pr.plot_id
      LEFT JOIN plants p ON p.plant_id = pl.plant_id
      WHERE t.amount < 0
        AND pr.user_id = :user_id
      GROUP BY p.plant_name
      ORDER BY amount DESC
      `,
      { replacements: { user_id }, type: QueryTypes.SELECT }
    );

    const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const result = rows.map((r) => ({
      plant_name: r.plant_name,
      amount: Number(r.amount),
      percentage: total ? ((r.amount / total) * 100).toFixed(1) : 0,
    }));

    res.json({ total_expense: total, plants: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Income By Plant (New)
exports.getIncomeByPlant = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const rows = await sequelize.query(
      `
      SELECT 
        p.plant_name,
        COALESCE(SUM(t.amount), 0) AS amount
      FROM transactions t
      LEFT JOIN production_rounds pr ON pr.round_id = t.round_id
      LEFT JOIN plots pl ON pl.plot_id = pr.plot_id
      LEFT JOIN plants p ON p.plant_id = pl.plant_id
      WHERE t.amount > 0
        AND pr.user_id = :user_id
      GROUP BY p.plant_name
      ORDER BY amount DESC
      `,
      { replacements: { user_id }, type: QueryTypes.SELECT }
    );

    const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const result = rows.map((r) => ({
      plant_name: r.plant_name,
      amount: Number(r.amount),
      percentage: total ? ((r.amount / total) * 100).toFixed(1) : 0,
    }));

    res.json({ total_income: total, plants: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Profit By Plant (New)
exports.getProfitByPlant = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const rows = await sequelize.query(
      `
      SELECT 
        p.plant_name,
        COALESCE(SUM(pr.income_total - pr.expense_total), 0) AS amount
      FROM production_rounds pr
      LEFT JOIN plots pl ON pl.plot_id = pr.plot_id
      LEFT JOIN plants p ON p.plant_id = pl.plant_id
      WHERE pr.user_id = :user_id
      GROUP BY p.plant_name
      ORDER BY amount DESC
      `,
      { replacements: { user_id }, type: QueryTypes.SELECT }
    );

    const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const result = rows.map((r) => ({
      plant_name: r.plant_name,
      amount: Number(r.amount),
      percentage: total ? ((r.amount / total) * 100).toFixed(1) : 0,
    }));

    res.json({ total_profit: total, plants: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};