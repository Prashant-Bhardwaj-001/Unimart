const Order = require(
  "../models/Order"
);

const Product = require(
  "../models/Product"
);

const PurchaseOrder = require(
  "../models/PurchaseOrder"
);

const Customer = require(
  "../models/Customer"
);

const User = require(
  "../models/User"
);

const getAdminDashboard =
  async (req, res) => {
    try {

      /*
      ==========================
      SALES OVERVIEW
      ==========================
      */

      const salesData =
        await Order.aggregate([
          {
            $match: {
              status:
                "COMPLETED",
            },
          },
          {
            $group: {
              _id: null,

              totalOrders: {
                $sum: 1,
              },

              totalRevenue: {
                $sum:
                  "$grandTotal",
              },

              totalDiscount: {
                $sum:
                  "$discount",
              },

              totalTax: {
                $sum:
                  "$taxAmount",
              },
            },
          },
        ]);

      /*
      ==========================
      PROFIT
      ==========================
      */

      const orders =
        await Order.find({
          status:
            "COMPLETED",
        });

      let totalProfit = 0;

      for (
        const order of orders
      ) {
        for (
          const item of order.items
        ) {
          totalProfit +=
            (item.sellingPrice -
              item.costPrice) *
            item.quantity;
        }
      }

      /*
      ==========================
      ALERTS
      ==========================
      */

      const lowStockCount =
        await Product.countDocuments(
          {
            $expr: {
              $lte: [
                "$stockQuantity",
                "$lowStockThreshold",
              ],
            },
          }
        );

      const outOfStockCount =
        await Product.countDocuments(
          {
            stockQuantity: 0,
          }
        );

      const pendingPOCount =
        await PurchaseOrder.countDocuments(
          {
            status:
              "PENDING",
          }
        );

      /*
      ==========================
      COUNTS
      ==========================
      */

      const totalProducts =
        await Product.countDocuments();

      const totalCustomers =
        await Customer.countDocuments();

      const totalUsers =
        await User.countDocuments();

      /*
      ==========================
      TOP PRODUCTS
      ==========================
      */

      const topProducts =
        await Order.aggregate([
          {
            $unwind:
              "$items",
          },

          {
            $group: {
              _id:
                "$items.product",

              productName: {
                $first:
                  "$items.productName",
              },

              totalSold: {
                $sum:
                  "$items.quantity",
              },
            },
          },

          {
            $sort: {
              totalSold:
                -1,
            },
          },

          {
            $limit: 5,
          },
        ]);

      /*
      ==========================
      RECENT ORDERS
      ==========================
      */

      const recentOrders =
        await Order.find()
          .populate(
            "cashier",
            "name"
          )
          .sort({
            createdAt: -1,
          })
          .limit(10);

      /*
      ==========================
      RECENT PURCHASE ORDERS
      ==========================
      */

      const recentPurchaseOrders =
        await PurchaseOrder.find()
          .populate(
            "supplier",
            "companyName"
          )
          .sort({
            createdAt: -1,
          })
          .limit(10);

      return res.status(200).json({
        success: true,

        data: {
          overview:
            salesData[0] || {},

          totalProfit,

          lowStockCount,

          outOfStockCount,

          pendingPOCount,

          totalProducts,

          totalCustomers,

          totalUsers,

          topProducts,

          recentOrders,

          recentPurchaseOrders,
        },
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };

module.exports = {
  getAdminDashboard,
};