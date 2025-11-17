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
    let { user_id, round_id, category_id, amount, note, date, plot_id } = req.body;

    // STEP 1 — หา round หรือสร้างใหม่
    if (!round_id && plot_id) {
      let round = await Round.findOne({ where: { plot_id } });

      // ⬇ ถ้าไม่เจอรอบ → สร้างรอบใหม่ทันที
      if (!round) {
        round = await Round.create({
          plot_id,
          user_id,
          round_name: "รอบการปลูกครั้งแรก",
          start_date: date,         // ใช้วันที่ทำรายการ
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

    // STEP 2 — สร้าง transaction
    const tx = await Transaction.create({
      user_id,
      round_id,
      category_id,
      amount,
      note,
      date
    });

    // STEP 3 — อัปเดตรวมยอดให้ round
    const totals = await sequelize.query(`
      SELECT
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount END), 0) AS income_total,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) END), 0) AS expense_total
      FROM transactions
      WHERE round_id = :round_id
    `, {
      replacements: { round_id },
      type: QueryTypes.SELECT
    });

    await Round.update(
      {
        income_total: totals[0].income_total,
        expense_total: totals[0].expense_total
      },
      { where: { round_id } }
    );

    res.json({
      message: "Transaction created successfully",
      round_id,
      totals: totals[0],
      transaction: tx
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};



