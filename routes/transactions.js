// LIST
// POST /lists   สร้างรายการรายรับ - รายจ่าย
// 	RequestBody {
// 		amount : Double
// 		createdAt : DATE
// 		typeList : id typeList  -->  id of the type of income and expense
//      Categories: id categories  -->      Categories according to income and expenses    
// 		plotId : id plot  -->  id of the plot where the income and expense are recorded
// 		description : String
// }
// GET /lists/:userId ← plot array แสดงข้อมูลทั้งหมดของผู้ใช้ แปลงพืชวอะไรบ้าง รายรับทั้งหมด รายจ่ายทั้งหมด กำไรสุทธิทั้งหมด ยังไงบ้าง
// GET /lists/:plotId ← detail plot array แสดงรายละเอียดใน แปลงพืชรายได้รวมเท่าไหร่ รายจ่ายรวมเท่าไหร่ ข้างในการใช้จ่ายประวัติการใช้จ่าย รายรับรายจ่าย วันที่เท่าไหร่ และ ข้อความหมายเหตุในการ รายรับรายจ่ายนั้น
// GET /lists 

const express = require('express');
const router = express.Router();
const Transactions = require('../models/transactions');
const Plots = require('../models/plots');
const Users = require('../models/users');
const ProductionRounds = require('../models/productionRounds');
const TransactionCategory = require('../models/transactionCategory');
const TransactionType = require('../models/transactionType');

// POST /transactions - สร้างรายการรายรับ-รายจ่าย
router.post('/', async (req, res) => {
    try {
        const { amount, date, category_id, round_id, note, user_id } = req.body;

        // Validate required fields ตามโมเดล
        if (!amount || !category_id || !user_id) {
            return res.status(400).json({
                status: "error",
                message: "amount, category_id and user_id are required"
            });
        }

        // Validate amount (must be positive number)
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({
                status: "error",
                message: "amount must be a positive number"
            });
        }

        // Validate/normalize date (DATEONLY in model)
        let dateOnly = undefined;
        if (date) {
            const d = new Date(date);
            if (isNaN(d.getTime())) {
                return res.status(400).json({ status: "error", message: "Invalid date format" });
            }
            dateOnly = d.toISOString().slice(0, 10);
        }

        // validate user exists
        const user = await Users.findOne({ where: { user_id } });
        if (!user) return res.status(404).json({ status: "error", message: "User not found" });

        // validate category exists
        const category = await TransactionCategory.findOne({ where: { id: category_id } });
        if (!category) return res.status(404).json({ status: "error", message: "Category not found" });

        // validate round if provided
        let round = null;
        if (round_id) {
            round = await ProductionRounds.findOne({ where: { round_id } });
            if (!round) return res.status(404).json({ status: "error", message: "Round not found" });
        }

        const newTransaction = await Transactions.create({
            amount: amountNum,
            user_id,
            category_id,
            round_id: round ? round.round_id : null,
            note: note || null,
            date: dateOnly || undefined
        });

        res.status(201).json({
            status: "success",
            message: "Transaction created successfully",
            data: newTransaction
        });

    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
});

// GET /transactions/:userId - สรุปของผู้ใช้ (รวมรายรับ รายจ่าย กำไรสุทธิ + แปลงพืช)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                status: "error",
                message: "User ID is required"
            });
        }

        // ตรวจสอบ user
        const user = await Users.findOne({ where: { user_id: userId } });
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // ดึง plots ของผู้ใช้ (ไม่ join plants เพราะไม่ได้กำหนด association ในโมเดล)
        const plots = await Plots.findAll({ where: { user_id: userId } });

        // ดึงรายการทั้งหมดของผู้ใช้ พร้อม category และ type
        const transactions = await Transactions.findAll({
            where: { user_id: userId },
            include: [
                { model: TransactionCategory, attributes: ['id', 'name', 'type_id'], include: [{ model: TransactionType, attributes: ['id', 'name'] }] }
            ]
        }).catch(() => []);

        // คำนวณ total income/expense จาก TransactionType (สมมติ type name: 'income'/'expense')
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals = {};

        for (const t of transactions) {
            const amt = parseFloat(t.amount) || 0;
            const cat = t.transaction_category || t.TransactionCategory;
            const type = cat && (cat.transaction_type || cat.TransactionType);
            const typeName = type?.name?.toLowerCase();

            if (typeName === 'income') totalIncome += amt;
            else if (typeName === 'expense') totalExpense += amt;

            if (cat?.name) {
                categoryTotals[cat.name] = (categoryTotals[cat.name] || 0) + amt;
            }
        }
        const netProfit = totalIncome - totalExpense;

        const categoryBreakdown = Object.entries(categoryTotals).map(([name, amount]) => ({
            category: name,
            amount,
        }));

        res.status(200).json({
            status: "success",
            message: "User summary retrieved successfully",
            data: {
                userId,
                plots,
                summary: {
                    netProfit,
                    totalIncome,
                    totalExpense
                },
                categoryBreakdown
            }
        });

    } catch (error) {
        console.error('Get user summary error:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
});

// GET /transactions?plotId=xxx - แสดงรายละเอียดในแปลงพืช
// เรียกใช้: GET /lists?plotId=xxx
router.get('/', async (req, res) => {
    try {
        const { plotId, userId } = req.query;

        // ถ้ามี plotId ให้แสดงรายละเอียดแปลงพืช
        if (plotId) {
            // ตรวจสอบว่า plot มีอยู่จริง
            const plot = await Plots.findOne({ where: { plot_id: plotId } });
            if (!plot) {
                return res.status(404).json({ status: "error", message: "Plot not found" });
            }

            // ดึงรอบการผลิตของ plot นี้
            const rounds = await ProductionRounds.findAll({ where: { plot_id: plotId } });
            const roundIds = rounds.map(r => r.round_id);

            // ดึงธุรกรรมของรอบเหล่านี้
            const txs = await Transactions.findAll({
                where: roundIds.length ? { round_id: roundIds } : { round_id: null },
                order: [['date', 'DESC']],
                include: [
                    { model: TransactionCategory, attributes: ['id', 'name', 'type_id'], include: [{ model: TransactionType, attributes: ['id', 'name'] }] }
                ]
            }).catch(() => []);

            let totalIncome = 0;
            let totalExpense = 0;
            const expenseCategoryTotals = {};

            for (const t of txs) {
                const amt = parseFloat(t.amount) || 0;
                const cat = t.transaction_category || t.TransactionCategory;
                const type = cat && (cat.transaction_type || cat.TransactionType);
                const typeName = type?.name?.toLowerCase();

                if (typeName === 'income') totalIncome += amt;
                else if (typeName === 'expense') {
                    totalExpense += amt;
                    if (cat?.name) expenseCategoryTotals[cat.name] = (expenseCategoryTotals[cat.name] || 0) + amt;
                }
            }

            const expenseCategoryBreakdown = Object.entries(expenseCategoryTotals).map(([category, amount]) => ({ category, amount }));

            return res.status(200).json({
                status: "success",
                message: "Plot details retrieved successfully",
                data: {
                    plot,
                    summary: {
                        totalIncome,
                        totalExpense,
                        netProfit: totalIncome - totalExpense
                    },
                    transactions: txs,
                    expenseCategoryBreakdown
                }
            });
        }

        // ถ้าไม่มี plotId และไม่มี userId ให้แสดงรายการทั้งหมด
        // TODO: ถ้ามี authentication อาจจะดึง userId จาก session/token
        // const userId = req.session.user?.id || req.user?.id;

        const transactions = await Transactions.findAll({
            order: [['date', 'DESC']],
            include: [
                { model: TransactionCategory, attributes: ['id', 'name', 'type_id'], include: [{ model: TransactionType, attributes: ['id', 'name'] }] }
            ]
        }).catch(() => []);

        res.status(200).json({
            status: "success",
            message: "Transactions retrieved successfully",
            data: {
                transactions,
                total: transactions.length
            }
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
});

module.exports = router;