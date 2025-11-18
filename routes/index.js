const express = require('express');
const router = express.Router();

const userRoutes = require('./users');
const plantRoutes = require('./plants');
const plotRoutes = require('./plots');
const roundRoutes = require('./rounds');
const transactionRoutes = require('./transactions');
const dashboardRoutes = require('./dashboard');


router.use('/users', userRoutes);
router.use('/plants', plantRoutes);
router.use('/plots', plotRoutes);
router.use('/rounds', roundRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use("/yield-history", require("./yieldHistory"));
router.use("/predict-yield", require("./predictYield"));




router.get('/', (req, res) => {
  res.json({ message: ' API is working!' });
});

module.exports = router;
