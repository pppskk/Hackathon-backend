const express = require('express');
const router = express.Router();

router.use('/users', require('./router/users.js'));
router.use('/lists', require('./router/wallet.js'));
router.use('/plot', require('../../cryptos.js'));

module.exports = router;