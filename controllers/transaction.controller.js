const Transaction = require('../models/transactions');
const Round = require('../models/productionRounds');
const TransactionCategory = require('../models/transactionCategory'); // Import
const { sequelize } = require('../function/postgre');
const { QueryTypes } = require('sequelize');

// GET /api/transactions/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await TransactionCategory.findAll({
      order: [['id', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { round_id } = req.query;
    const items = await Transaction.findAll({ where: { round_id } });
    res.json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    let { user_id, round_id, category_id, amount, note, date, plot_id } = req.body;

    if (!round_id && plot_id) {
      let round = await Round.findOne({ where: { plot_id } });
      if (!round) {
        round = await Round.create({
          plot_id,
          user_id,
          round_name: null,
          start_date: date,
          end_date: null,
          income_total: 0,
          expense_total: 0
        });
      }
      round_id = round.round_id;
    }

    if (!round_id) {
      return res.status(400).json({ error: "Missing round_id" });
    }

    const tx = await Transaction.create({
      user_id, round_id, category_id, amount, note, date
    });

    const totals = await sequelize.query(`
      SELECT
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount END), 0) AS income_total,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) END), 0) AS expense_total
      FROM transactions
      WHERE round_id = :round_id
    `, { replacements: { round_id }, type: QueryTypes.SELECT });

    await Round.update(
      {
        income_total: totals[0].income_total,
        expense_total: totals[0].expense_total
      },
      { where: { round_id } }
    );

    res.json({ message: "Transaction created successfully", round_id, totals: totals[0], transaction: tx });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
