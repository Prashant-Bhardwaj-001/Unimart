const Order = require("../models/Order");
const Product = require("../models/Product");
const PurchaseOrder = require("../models/PurchaseOrder");
const Customer = require("../models/Customer");
const User = require("../models/User");

const getAdminDashboard = async (req, res) => {
  try {
    /* ==========================
       1. SALES OVERVIEW (AGGREGATION)
       ========================== */
    const salesData = await Order.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$grandTotal" },
          totalDiscount: { $sum: "$discount" },
          totalTax: { $sum: "$taxAmount" },
        },
      },
    ]);

    /* ==========================
       2. NET PROFIT OPTIMIZATION
       ========================== */
    const profitData = await Order.aggregate([
      { $match: { status: "COMPLETED" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ["$items.sellingPrice", "$items.costPrice"] },
                "$items.quantity",
              ],
            },
          },
        },
      },
    ]);
    const totalProfit = profitData[0]?.totalProfit || 0;

    /* ==========================
       3. CRITICAL ALERTS COUNTS
       ========================== */
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
    });

    const outOfStockCount = await Product.countDocuments({ stockQuantity: 0 });

    const pendingPOCount = await PurchaseOrder.countDocuments({ status: "PENDING" });

    /* ==========================
       4. REGISTRY SYSTEM COUNTS
       ========================== */
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalUsers = await User.countDocuments();

    /* ==========================
       5. 100% LIVE HOURLY SALES GRAPH GRAPHIC
       ========================== */
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const hourlySalesData = await Order.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: { $gte: startOfToday },
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          sales: { $sum: "$grandTotal" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format hours to readable format (e.g., 9 -> "09:00 AM")
    const hourlySales = hourlySalesData.map((item) => {
      const hour = item._id;
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return {
        time: `${displayHour.toString().padStart(2, "0")}:00 ${ampm}`,
        sales: item.sales,
      };
    });

    /* ==========================
       6. HIGH-VELOCITY FAST MOVING GOODS
       ========================== */
    const topProducts = await Order.aggregate([
      { $match: { status: "COMPLETED" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.productName" },
          sales: { $sum: "$items.quantity" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    /* ==========================
       7. DYNAMIC LEAST MOVING STAGNANT STOCKS
       ========================== */
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leastMovingItems = await Product.find({
      updatedAt: { $lte: thirtyDaysAgo },
      stockQuantity: { $gt: 0 },
    })
      .select("productName stockQuantity updatedAt")
      .limit(5)
      .lean();

    // Map fields so frontend reads cleanly
    const mappedLeastMoving = leastMovingItems.map((item) => {
      const diffTime = Math.abs(new Date() - new Date(item.updatedAt));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        id: item._id,
        name: item.productName,
        stockAge: diffDays,
      };
    });

    /* ==========================
       8. HISTORICAL RUN LOGS (FOR SUB-MODULE DRILLDOWN)
       ========================== */
    const recentOrders = await Order.find()
      .populate("cashier", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentPurchaseOrders = await PurchaseOrder.find()
      .populate("supplier", "companyName")
      .sort({ createdAt: -1 })
      .limit(10);

    /* ==========================
       RESPONSE DESPATCH MATRIX
       ========================== */
    return res.status(200).json({
      success: true,
      data: {
        overview: salesData[0] || { totalRevenue: 0, totalOrders: 0 },
        totalProfit,
        lowStockCount,
        outOfStockCount,
        pendingPOCount,
        totalProducts,
        totalCustomers,
        totalUsers,
        hourlySales,
        fastMovingItems: topProducts,
        leastMovingItems: mappedLeastMoving,
        recentOrders,
        recentPurchaseOrders,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
};