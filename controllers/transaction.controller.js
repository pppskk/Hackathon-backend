const Transaction = require('../models/transactions');
const TransactionCategory = require('../models/transactionCategory');
const Round = require('../models/productionRounds');
const { sequelize } = require('../function/postgre');
const { QueryTypes } = require('sequelize');


exports.getTransactions = async (req, res) => {
  try {
    const { round_id } = req.query;
    const sessionUserId = req.session.userId;
    
    if (!round_id) {
      return res.status(400).json({ error: 'round_id is required' });
    }

    // เช็คว่า round นี้เป็นของ user นี้หรือไม่
    const round = await Round.findByPk(round_id);
    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }
    if (round.user_id !== sessionUserId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You can only access your own transactions' 
      });
    }

    // ดึง transactions พร้อมข้อมูล category
    const items = await Transaction.findAll({ 
      where: { round_id },
      include: [{
        model: TransactionCategory,
        attributes: ['id', 'name', 'type_id', 'description']
      }],
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
    
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

    // 2) อัปเดตยอดรวมของรอบ (แยกรายรับ-รายจ่าย)
    const sums = await sequelize.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN tc.type_id = 1 THEN t.amount ELSE 0 END), 0) AS expense_total,
        COALESCE(SUM(CASE WHEN tc.type_id = 2 THEN t.amount ELSE 0 END), 0) AS income_total
      FROM transactions t
      JOIN transaction_categories tc ON t.category_id = tc.id
      WHERE t.round_id = :round_id
    `, {
      replacements: { round_id },
      type: QueryTypes.SELECT
    });

    const expense_total = parseFloat(sums[0].expense_total);
    const income_total = parseFloat(sums[0].income_total);
    const profit_total = income_total - expense_total;

    // 3) อัปเดตรอบใน production_rounds
    await Round.update(
      { 
        expense_total,
        income_total
      },
      { where: { round_id } }
    );

    res.status(201).json({
      message: "Transaction added and round updated.",
      transaction: tx,
      summary: {
        expense_total,
        income_total,
        profit_total
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

