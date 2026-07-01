const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorMiddleware");
const authRoutes =require("./routes/authRoutes");
const userRoutes =require("./routes/userRoutes");
const supplierRoutes =require("./routes/supplierRoutes");
const productRoutes =require("./routes/productRoutes");
const inventoryRoutes =require("./routes/inventoryRoutes");
const purchaseOrderRoutes =require("./routes/purchaseOrderRoutes");
const supplierPortalRoutes =require("./routes/supplierPortalRoutes");
const goodsReceiptRoutes =require("./routes/goodsReceiptRoutes");
const orderRoutes =require("./routes/orderRoutes");
const customerRoutes =require("./routes/customerRoutes");
const alertRoutes = require("./routes/alertRoutes");
const analyticsRoutes =require("./routes/analyticsRoutes");
const dashboardRoutes =require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(errorHandler);

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/suppliers",supplierRoutes);
app.use("/api/products",productRoutes);
app.use("/api/inventory",inventoryRoutes);
app.use("/api/purchase-orders",purchaseOrderRoutes);
app.use("/api/supplier",supplierPortalRoutes);
app.use("/api/goods-receipts",goodsReceiptRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/customers",customerRoutes);
app.use("/api/alerts",alertRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/dashboard",dashboardRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Supermarket Management API Running"
  });
});

module.exports = app;