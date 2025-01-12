const CollectRequest = require("../model/collectRequest");
const CollectRequestStatus = require("../model/collectRequestStatus");

const getAllTransactions = async (query) => {
  console.log(query);
  try {
    const collectRequests = await CollectRequest.find();

    const transactions = await Promise.all(
      collectRequests.map(async (request) => {
        const status = await CollectRequestStatus.findOne({
          collect_id: request._id.toString(),
        });

        // Filter based on query parameters
        if (
          (query.status && status.status !== query.status) || // Filter by status if provided
          (query.school_id && request.school_id !== query.school_id) || // Filter by collect_id if provided
          (query.gateway && status.gateway !== query.gateway) // Filter by gateway if provided
        ) {
          return null; // Skip transaction if any condition is not met
        }

        const res = combineData(request, status);

        return res; // Return transaction if all conditions are met
      })
    );

    return transactions.filter(Boolean); // Filter out null values (transactions that did not match the filters)
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  }
};

const checkStatus = async (query) => {
  console.log(query.custom_order_id);
  try {
    const collectRequests = await CollectRequest.find();

    const transactions = await Promise.all(
      collectRequests.map(async (request) => {
        const status = await CollectRequestStatus.findOne({
          collect_id: request._id.toString(),
        });

        // Filter based on query parameters
        if (
          query.custom_order_id &&
          request.custom_order_id !== query.custom_order_id // Filter by collect_id if provided
        ) {
          return null; // Skip transaction if any condition is not met
        }

        const res = combineData(request, status);

        return res; // Return transaction if all conditions are met
      })
    );

    return transactions.filter(Boolean); // Filter out null values (transactions that did not match the filters)
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  }
};

const updateTransactionStatus = async (reqBody) => {
  try {
    const { transaction_id, status } = reqBody;

    if (!transaction_id || !status) {
      throw new Error("Missing required fields: transaction_id, status");
    }

    // Find the transaction status by transaction_id
    const updatedStatus = await CollectRequestStatus.findOneAndUpdate(
      { collect_id: String(transaction_id) }, // Ensure it's a string
      { $set: { status } },
      { new: true, runValidators: true } // Return updated document
    );

    console.log(updatedStatus);

    if (!updatedStatus) {
      throw new Error(
        `Transaction not found for collect_id: ${transaction_id}`
      );
    }

    console.log("Updated Transaction:", updatedStatus);
    return { message: "Transaction status updated successfully" };
  } catch (error) {
    console.error("Error updating transaction status:", error.message);
    throw new Error("Failed to update transaction status");
  }
};

const handleWebhook = async (webhookInfo) => {
  console.log("webhookInfo");

  try {
    const { status, orderInfo } = webhookInfo;
    if (!orderInfo || !orderInfo.order_id) {
      throw new Error(
        "Invalid webhook payload: Missing order_info or order_id"
      );
    }

    const existanceTransactions = await CollectRequest.findOne({
      custom_order_id: orderInfo.order_id,
    });

    if (!existanceTransactions) {
      throw new Error(`Transaction is not found`);
    }

    const updateStatus = await CollectRequestStatus.findOneAndUpdate(
      {
        collect_id: existanceTransactions._id.toString(),
      },
      {
        status: data.status === 200 ? "SUCCESS" : "FAILED",
        payment_method: orderInfo.payment_method,
        gateway: orderInfo.gateway || existanceTransactions.gateway,
        transaction_amount: orderInfo.transaction_amount,
        bank_refrence: orderInfo.bank_reference,
      },
      { upsert: true, new: true }
    );
    return updateStatus;
  } catch (error) {
    console.log("Error webhook", error);
    throw error;
  }
};

const combineData = (request, status) => ({
  collect_id: request._id,
  school_id: request.school_id,
  gateway: request.gateway,
  order_amount: request.order_amount,
  transaction_amount: status?.transaction_amount,
  status: status?.status || "PENDING",
  custom_order_id: request.custom_order_id,
  payment_method: status?.payment_method,
  bank_reference: status?.bank_reference,
  created_at: request.createdAt,
});

const makePaymentRequest = async (data) => {
  const collectRequest = await CollectRequest.create({
    school_id: data.school_id,
    trustee_id: data.trustee_id,
    gateway: "CASHFREE",
    order_amount: data.amount,
    custom_order_id: `ORD_${Date.now()}`,
  });

  const payload = {
    school_id: data.school_id,
    pg_key: process.env.PG_KEY,
    collect_id: collectRequest._id,
    custom_order_id: collectRequest.custom_order_id,
    amount: data.amount,
  };

  const response = await axios.post(
    "https://dev-vanilla.edviron.com/erp/create-collect-request",
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  await CollectRequestStatus.create({
    collect_id: collectRequest._id,
    status: "PENDING",
    gateway: "CASHFREE",
    transaction_amount: null,
    bank_reference: null,
  });

  return {
    success: true,
    collect_id: collectRequest._id,
    payment_link: response.data.payment_link,
  };
};

module.exports = {
  getAllTransactions,
  checkStatus,
  updateTransactionStatus,
  handleWebhook,
};
