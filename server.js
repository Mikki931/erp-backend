const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routerMember = require("./routes/member.route");
const routerBOM = require("./routes/bom.route");
const routerExpense = require("./routes/expense.route");
const routerInvoice = require("./routes/invoice.route");
const routerPayment = require("./routes/payment.route");
const routerProduct = require("./routes/product.route");
const routerPurchaseOrder = require("./routes/purchaseOrder.route");
const routerSalesOrder = require("./routes/salesOrder.route");

const { authMiddleware } = require("./middleware/authmiddleware");

const Member = require("./models/Member");
const Product = require("./models/Product");
const SalesOrder = require("./models/SalesOrder");
const PurchaseOrder = require("./models/PurchaseOrder");
const Invoice = require("./models/Invoice");

const app = express();

require("dotenv").config();

const corsOptions = {
  origin: [
    "https://erp-frontend-mu-opal.vercel.app",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Erp running");
});

app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();

    // revenue should track actual invoiced/delivered orders.
    // invoices are created automatically when an order is marked delivered.
    const invoicesForSales = await Invoice.find({});
    let totalSales = 0;
    invoicesForSales.forEach((inv) => {
      totalSales += inv.totalAmount || 0;
    });

    const purchaseOrders = await PurchaseOrder.find();
    let totalPurchase = 0;
    purchaseOrders.forEach((order) => {
      order.items.forEach((item) => {
        totalPurchase += item.quantity * item.rate;
      });
    });

    const products = await Product.find();
    const inventoryStock = products.reduce(
      (sum, product) => sum + product.currentStock,
      0,
    );

    const pendingOrders = await SalesOrder.countDocuments({
      status: "Pending",
    });

    const unpaidInvoices = await Invoice.find({ paid: false });
    const pendingPayments = unpaidInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0,
    );

    res.json({
      totalSales,
      totalPurchase,
      totalMembers,
      inventoryStock,
      pendingOrders,
      pendingPayments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/members", routerMember);
app.use("/bom", routerBOM);
app.use("/expense", routerExpense);
app.use("/invoice", routerInvoice);
app.use("/payment", routerPayment);
app.use("/product", routerProduct);
app.use("/purchaseOrder", routerPurchaseOrder);
app.use("/salesOrder", routerSalesOrder);

mongoose
  .connect(process.env.mongourl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

const PORT = process.env.PORT || 3001;

// Vercel runs this file as a Serverless Function.
// Only start a server when running locally (e.g. `npm run dev`).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
