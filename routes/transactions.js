// // LIST
// // POST /lists   สร้างรายการรายรับ - รายจ่าย
// // 	RequestBody {
// // 		amount : Double
// // 		createdAt : DATE
// // 		typeList : id typeList  -->  id of the type of income and expense
// //      Categories: id categories  -->      Categories according to income and expenses    
// // 		plotId : id plot  -->  id of the plot where the income and expense are recorded
// // 		description : String
// // }
// // GET /lists/:userId ← plot array แสดงข้อมูลทั้งหมดของผู้ใช้ แปลงพืชวอะไรบ้าง รายรับทั้งหมด รายจ่ายทั้งหมด กำไรสุทธิทั้งหมด ยังไงบ้าง
// // GET /lists/:plotId ← detail plot array แสดงรายละเอียดใน แปลงพืชรายได้รวมเท่าไหร่ รายจ่ายรวมเท่าไหร่ ข้างในการใช้จ่ายประวัติการใช้จ่าย รายรับรายจ่าย วันที่เท่าไหร่ และ ข้อความหมายเหตุในการ รายรับรายจ่ายนั้น
// // GET /lists 

// const express = require('express');
// const router = express.Router();
// const Transactions = require('../models/transactions');
// const Plots = require('../models/plots');
// const Users = require('../models/users');

// // POST /lists - สร้างรายการรายรับ-รายจ่าย
// router.post('/', async (req, res) => {
//     try {
//         const { amount, createdAt, typeList, Categories, plotId, description, userId } = req.body;

//         // Validate required fields
//         if (!amount || !createdAt || !typeList || !Categories) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "amount, createdAt, typeList, and Categories are required"
//             });
//         }

//         // Validate userId (required for associating transaction with user)
//         if (!userId) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "userId is required"
//             });
//         }

//         // Validate amount (must be positive number)
//         const amountNum = parseFloat(amount);
//         if (isNaN(amountNum) || amountNum <= 0) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "amount must be a positive number"
//             });
//         }

//         // Validate createdAt format
//         const transactionDate = new Date(createdAt);
//         if (isNaN(transactionDate.getTime())) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid createdAt format"
//             });
//         }

//         // Validate typeList (should be 'income' or 'expense' or their IDs)
//         // typeList: 1 = expense, 2 = income (ตัวอย่าง)
//         if (typeList !== 1 && typeList !== 2 && typeList !== 'expense' && typeList !== 'income') {
//             return res.status(400).json({
//                 status: "error",
//                 message: "typeList must be 'expense' (1) or 'income' (2)"
//             });
//         }

//         // Validate plotId if provided (should be valid plot ID or null for "ไม่ระบุ")
//         if (plotId) {
//             // TODO: ตรวจสอบว่า plotId มีอยู่จริงและเป็นของ user นี้
//             // const plot = await Plots.findOne({
//             //   where: { plot_id: plotId, user_id: userId }
//             // });
//             // if (!plot) {
//             //   return res.status(404).json({
//             //     status: "error",
//             //     message: "Plot not found or does not belong to user"
//             //   });
//             // }
//         }

//         // TODO: ตรวจสอบว่ามี user นี้อยู่จริงหรือไม่
//         // const user = await Users.findOne({
//         //   where: { user_id: userId }
//         // });
//         // if (!user) {
//         //   return res.status(404).json({
//         //     status: "error",
//         //     message: "User not found"
//         //   });
//         // }

//         // TODO: สร้างรายการรายรับ-รายจ่ายใน database
//         // const newTransaction = await Transactions.create({
//         //   amount: amountNum,
//         //   createdAt: transactionDate,
//         //   typeList: typeList, // 1 = expense, 2 = income
//         //   Categories: Categories, // category ID
//         //   plotId: plotId || null,
//         //   description: description || null,
//         //   user_id: userId
//         // });

//         // Mock response
//         const mockTransaction = {
//             transaction_id: Math.floor(Math.random() * 10000),
//             amount: amountNum,
//             createdAt: transactionDate.toISOString(),
//             typeList: typeList,
//             Categories: Categories,
//             plotId: plotId || null,
//             description: description || null,
//             user_id: userId
//         };

//         res.status(201).json({
//             status: "success",
//             message: "Transaction created successfully",
//             data: mockTransaction
//         });

//     } catch (error) {
//         console.error('Create transaction error:', error);
//         res.status(500).json({
//             status: "error",
//             message: "Internal server error"
//         });
//     }
// });

// // GET /lists/:userId - แสดงข้อมูลทั้งหมดของผู้ใช้ (แปลงพืช, รายรับ, รายจ่าย, กำไรสุทธิ)
// router.get('/:userId', async (req, res) => {
//     try {
//         const { userId } = req.params;

//         if (!userId) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "User ID is required"
//             });
//         }

//         // TODO: ตรวจสอบว่ามี user นี้อยู่จริงหรือไม่
//         // const user = await Users.findOne({
//         //   where: { user_id: userId }
//         // });
//         // if (!user) {
//         //   return res.status(404).json({
//         //     status: "error",
//         //     message: "User not found"
//         //   });
//         // }

//         // TODO: ดึงข้อมูลแปลงพืชทั้งหมดของผู้ใช้
//         // const plots = await Plots.findAll({
//         //   where: { user_id: userId }
//         // });

//         // TODO: ดึงข้อมูลรายการรายรับ-รายจ่ายทั้งหมดของผู้ใช้
//         // const transactions = await Transactions.findAll({
//         //   where: { user_id: userId },
//         //   include: [{
//         //     model: Plots,
//         //     as: 'plot'
//         //   }]
//         // });

//         // TODO: คำนวณรายได้รวม, ค่าใช้จ่ายรวม, กำไรสุทธิ
//         // const totalIncome = transactions
//         //   .filter(t => t.typeList === 2 || t.typeList === 'income')
//         //   .reduce((sum, t) => sum + parseFloat(t.amount), 0);
//         // const totalExpense = transactions
//         //   .filter(t => t.typeList === 1 || t.typeList === 'expense')
//         //   .reduce((sum, t) => sum + parseFloat(t.amount), 0);
//         // const netProfit = totalIncome - totalExpense;

//         // TODO: คำนวณรายการตามหมวดหมู่ (สำหรับกราฟ)
//         // const categoryBreakdown = calculateCategoryBreakdown(transactions);

//         // Mock data สำหรับทดสอบ logic
//         const mockPlots = [
//             {
//                 plot_id: 1,
//                 plant_name: "ข้าวโพด",
//                 plot_name: "ข้าวโพดหลังบ้าน",
//                 area_size: 5.0
//             },
//             {
//                 plot_id: 2,
//                 plant_name: "ข้าวหอมมะลิ",
//                 plot_name: "ข้าวหอมมะลิ",
//                 area_size: 12.0
//             },
//             {
//                 plot_id: 3,
//                 plant_name: "ขิง",
//                 plot_name: "ขิงแปลงใหญ่",
//                 area_size: 8.0
//             },
//             {
//                 plot_id: 4,
//                 plant_name: "พริก",
//                 plot_name: "พริกข้างเทศบาล",
//                 area_size: 3.0
//             }
//         ];

//         const mockTotalIncome = 450000;
//         const mockTotalExpense = 300000;
//         const mockNetProfit = mockTotalIncome - mockTotalExpense;

//         const mockCategoryBreakdown = [
//             { category: "ข้าวโพด", percentage: 35, amount: 105000 },
//             { category: "ขิง", percentage: 25, amount: 75000 },
//             { category: "ข้าวหอมมะลิ", percentage: 20, amount: 60000 },
//             { category: "พริก", percentage: 15, amount: 45000 },
//             { category: "ผักบุ้ง", percentage: 5, amount: 15000 }
//         ];

//         res.status(200).json({
//             status: "success",
//             message: "User summary retrieved successfully",
//             data: {
//                 userId: userId,
//                 plots: mockPlots,
//                 summary: {
//                     netProfit: mockNetProfit,
//                     totalIncome: mockTotalIncome,
//                     totalExpense: mockTotalExpense
//                 },
//                 categoryBreakdown: mockCategoryBreakdown
//             }
//         });

//     } catch (error) {
//         console.error('Get user summary error:', error);
//         res.status(500).json({
//             status: "error",
//             message: "Internal server error"
//         });
//     }
// });

// // GET /lists/:plotId - แสดงรายละเอียดในแปลงพืช (ใช้ query parameter เพื่อไม่ให้ conflict กับ userId)
// // เรียกใช้: GET /lists?plotId=xxx
// router.get('/', async (req, res) => {
//     try {
//         const { plotId, userId } = req.query;

//         // ถ้ามี plotId ให้แสดงรายละเอียดแปลงพืช
//         if (plotId) {
//             // TODO: ตรวจสอบว่ามีแปลงพืชนี้อยู่จริงหรือไม่
//             // const plot = await Plots.findOne({
//             //   where: { plot_id: plotId }
//             // });
//             // if (!plot) {
//             //   return res.status(404).json({
//             //     status: "error",
//             //     message: "Plot not found"
//             //   });
//             // }

//             // TODO: ดึงข้อมูลรายการรายรับ-รายจ่ายของแปลงพืชนี้
//             // const transactions = await Transactions.findAll({
//             //   where: { plotId: plotId },
//             //   order: [['createdAt', 'DESC']]
//             // });

//             // TODO: คำนวณรายได้รวม, ค่าใช้จ่ายรวม
//             // const incomeTransactions = transactions.filter(t => t.typeList === 2 || t.typeList === 'income');
//             // const expenseTransactions = transactions.filter(t => t.typeList === 1 || t.typeList === 'expense');
//             // const totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
//             // const totalExpense = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

//             // TODO: คำนวณรายการตามหมวดหมู่ (สำหรับกราฟค่าใช้จ่าย)
//             // const expenseCategoryBreakdown = calculateExpenseCategoryBreakdown(expenseTransactions);

//             // Mock data สำหรับทดสอบ logic
//             const mockPlot = {
//                 plot_id: plotId,
//                 plant_name: "ข้าวหอมมะลิ",
//                 plot_name: "ข้าวหอมมะลิ",
//                 area_size: 12.0,
//                 plant_date: "2025-10-10T00:00:00.000Z",
//                 harvest_date: "2025-11-25T00:00:00.000Z"
//             };

//             const mockTotalIncome = 32000;
//             const mockTotalExpense = 28000;

//             const mockTransactions = [
//                 {
//                     transaction_id: 1,
//                     typeList: 2, // income
//                     amount: 32000,
//                     createdAt: "2025-11-25T00:00:00.000Z",
//                     Categories: "ขายผลผลิต",
//                     description: "ขายผลผลิต",
//                     plotId: plotId
//                 },
//                 {
//                     transaction_id: 2,
//                     typeList: 1, // expense
//                     amount: 9000,
//                     createdAt: "2025-10-12T00:00:00.000Z",
//                     Categories: "ค่าปุ๋ย",
//                     description: "ค่าปุ๋ย",
//                     plotId: plotId
//                 },
//                 {
//                     transaction_id: 3,
//                     typeList: 1, // expense
//                     amount: 7000,
//                     createdAt: "2025-10-10T00:00:00.000Z",
//                     Categories: "ค่าจ้างแรงงาน",
//                     description: "ค่าจ้างแรงงาน",
//                     plotId: plotId
//                 }
//             ];

//             const mockExpenseCategoryBreakdown = [
//                 { category: "ค่าปุ๋ย", percentage: 35, amount: 9000 },
//                 { category: "ค่าจ้างแรงงาน", percentage: 25, amount: 7000 },
//                 { category: "ค่าเครื่องจักร", percentage: 20, amount: 5000 },
//                 { category: "ค่ายาปราบศัตรูพืช", percentage: 15, amount: 4000 },
//                 { category: "ค่าพันธุ์ข้าว", percentage: 5, amount: 1000 }
//             ];

//             return res.status(200).json({
//                 status: "success",
//                 message: "Plot details retrieved successfully",
//                 data: {
//                     plot: mockPlot,
//                     summary: {
//                         totalIncome: mockTotalIncome,
//                         totalExpense: mockTotalExpense,
//                         netProfit: mockTotalIncome - mockTotalExpense
//                     },
//                     plantingInfo: {
//                         plant_date: mockPlot.plant_date,
//                         harvest_date: mockPlot.harvest_date
//                     },
//                     transactions: mockTransactions,
//                     expenseCategoryBreakdown: mockExpenseCategoryBreakdown
//                 }
//             });
//         }

//         // ถ้าไม่มี plotId และไม่มี userId ให้แสดงรายการทั้งหมด
//         // TODO: ถ้ามี authentication อาจจะดึง userId จาก session/token
//         // const userId = req.session.user?.id || req.user?.id;

//         // TODO: ดึงข้อมูลรายการทั้งหมด
//         // const transactions = await Transactions.findAll({
//         //   include: [{
//         //     model: Plots,
//         //     as: 'plot'
//         //   }],
//         //   order: [['createdAt', 'DESC']]
//         // });

//         // Mock data
//         const mockTransactions = [
//             {
//                 transaction_id: 1,
//                 typeList: 2, // income
//                 amount: 32000,
//                 createdAt: "2025-11-25T00:00:00.000Z",
//                 Categories: "ขายผลผลิต",
//                 description: "ขายผลผลิต",
//                 plotId: 2
//             },
//             {
//                 transaction_id: 2,
//                 typeList: 1, // expense
//                 amount: 9000,
//                 createdAt: "2025-10-12T00:00:00.000Z",
//                 Categories: "ค่าปุ๋ย",
//                 description: "ค่าปุ๋ย",
//                 plotId: 2
//             }
//         ];

//         res.status(200).json({
//             status: "success",
//             message: "Transactions retrieved successfully",
//             data: {
//                 transactions: mockTransactions,
//                 total: mockTransactions.length
//             }
//         });

//     } catch (error) {
//         console.error('Get transactions error:', error);
//         res.status(500).json({
//             status: "error",
//             message: "Internal server error"
//         });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaction.controller');

router.get('/', controller.getTransactions);
router.post('/', controller.createTransaction);

module.exports = router;
