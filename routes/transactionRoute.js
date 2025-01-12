const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions); 
router.get("/check", transactionController.checkStatus);
router.post('/update', transactionController.updateTransactionStatus);
router.post('/webhook', transactionController.handleWebhook)

module.exports = router;