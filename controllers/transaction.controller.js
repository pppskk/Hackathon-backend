const Transaction = require('../models/transactions');
const Round = require('../models/productionRounds');
const { sequelize } = require('../function/postgre');
const { QueryTypes } = require('sequelize');


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
    const { round_id, user_id, category_id, amount, note, date } = req.body;

    if (!round_id || !user_id || !category_id || !amount) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 1) บันทึกรายการใหม่
    const tx = await Transaction.create({
      round_id,
      user_id,
      category_id,
      amount,
      note,
      date
    });

    // 2) อัปเดตยอดรวมของรอบ (SUM ใหม่จาก transactions)
    const sums = await sequelize.query(`
      SELECT 
        COALESCE(SUM(t.amount), 0) AS expense_total
      FROM transactions t
      WHERE t.round_id = :round_id
    `, {
      replacements: { round_id },
      type: QueryTypes.SELECT
    });

    const expense_total = sums[0].expense_total;

    // 3) อัปเดตรอบใน production_rounds
    await Round.update(
      { expense_total },
      { where: { round_id } }
    );

    res.status(201).json({
      message: "Transaction added and round updated.",
      transaction: tx,
      current_expense_total: expense_total
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

