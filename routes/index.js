const express = require('express');
const router = express.Router();


const userRoutes = require('./users');
const plantRoutes = require('./plants');
const plotRoutes = require('./plots');
const roundRoutes = require('./rounds');
const transactionRoutes = require('./transactions');
const dashboardRoutes = require('./dashboard');
const categoryRoutes = require('./categories');


router.use('/users', userRoutes);
router.use('/plants', plantRoutes);
router.use('/plots', plotRoutes);
router.use('/rounds', roundRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/categories', categoryRoutes);


router.get('/', (req, res) => {
  res.json({ message: ' API is working!' });
});

module.exports = router;
