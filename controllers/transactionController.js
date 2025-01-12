const CollectRequest = require("../model/collectRequest");
const CollectRequestStatus = require("../model/collectRequestStatus");
const transactionService = require("../services/transactionService");

const getAllTransactions = async (req, res) => {
  console.log(req.query);
  try {
    const transactions = await transactionService.getAllTransactions(req.query);
    res.status(200).send(transactions);
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log(error.message);
  }
};

const checkStatus = async (req, res) => {
  try {
    const transaction = await transactionService.checkStatus(req.query);
    res.status(200).send(transaction);
    console.log("Helllo");
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log(error.message);
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const transaction = await transactionService.updateTransactionStatus(
      req.body
    );
    res.status(200).send("Successfully Updated Status");
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const webhookInfo = req.body;
    if (!webhookInfo.status || !webhookInfo.orderInfo) {
      return res.status(400).send({ message: "Invalid webhook payloadInfo" });
    }
    const result = await transactionService.handleWebhook(webhookInfo);
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

module.exports = {
  getAllTransactions,
  checkStatus,
  updateTransactionStatus,
  handleWebhook,
}; // ✅ Export functions directly
