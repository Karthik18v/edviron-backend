const express = require("express");
const app = express();
const cors = require("cors");

const connectDb = require("./config/db");
connectDb();

app.use(express.json({ limit: "1mb" })); // Increase the limit
app.use(cors());

const authRoutes = require("./routes/authRoute");
const transactionRoute = require("./routes/transactionRoute");

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoute);

app.listen(4000, () => console.log(`Server Running At http://localhost:4000`));
