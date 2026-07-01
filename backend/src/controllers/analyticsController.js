const Order = require(
  "../models/Order"
);

/*
==================================
TOTAL SALES OVERVIEW
==================================
*/

const getSalesOverview =
  async (req, res) => {
    try {

      const result =
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

              totalTax: {
                $sum:
                  "$taxAmount",
              },

              totalDiscount: {
                $sum:
                  "$discount",
              },
            },
          },
        ]);

      return res.status(200).json({
        success: true,
        data:
          result[0] || {},
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };

/*
==================================
PROFIT ANALYTICS
==================================
*/

const getProfitAnalytics =
  async (req, res) => {
    try {

      const orders =
        await Order.find({
          status:
            "COMPLETED",
        });

      let totalRevenue =
        0;

      let totalCost =
        0;

      let totalProfit =
        0;

      for (
        const order of orders
      ) {

        totalRevenue +=
          order.grandTotal;

        for (
          const item of order.items
        ) {

          totalCost +=
            item.costPrice *
            item.quantity;

          totalProfit +=
            (item.sellingPrice -
              item.costPrice) *
            item.quantity;
        }
      }

      return res.status(200).json({
        success: true,

        data: {
          totalRevenue,

          totalCost,

          totalProfit,
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

/*
==================================
TOP SELLING PRODUCTS
==================================
*/

const getTopProducts =
  async (req, res) => {
    try {

      const products =
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

              revenue: {
                $sum:
                  "$items.total",
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
            $limit: 10,
          },
        ]);

      return res.status(200).json({
        success: true,
        data:
          products,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };

/*
==================================
PAYMENT METHOD ANALYTICS
==================================
*/

const getPaymentAnalytics =
  async (req, res) => {
    try {

      const result =
        await Order.aggregate([
          {
            $group: {
              _id:
                "$paymentMethod",

              totalOrders: {
                $sum: 1,
              },

              totalRevenue: {
                $sum:
                  "$grandTotal",
              },
            },
          },
        ]);

      return res.status(200).json({
        success: true,
        data:
          result,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };

/*
==================================
MONTHLY SALES
==================================
*/

const getMonthlySales =
  async (req, res) => {
    try {

      const sales =
        await Order.aggregate([
          {
            $group: {
              _id: {
                year: {
                  $year:
                    "$createdAt",
                },

                month: {
                  $month:
                    "$createdAt",
                },
              },

              totalRevenue: {
                $sum:
                  "$grandTotal",
              },

              totalOrders: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              "_id.year":
                1,

              "_id.month":
                1,
            },
          },
        ]);

      return res.status(200).json({
        success: true,
        data:
          sales,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };

/*
==================================
DAILY SALES
==================================
*/

const getDailySales =
  async (req, res) => {
    try {

      const sales =
        await Order.aggregate([
          {
            $group: {
              _id: {
                year: {
                  $year:
                    "$createdAt",
                },

                month: {
                  $month:
                    "$createdAt",
                },

                day: {
                  $dayOfMonth:
                    "$createdAt",
                },
              },

              totalRevenue: {
                $sum:
                  "$grandTotal",
              },

              totalOrders: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              "_id.year":
                -1,

              "_id.month":
                -1,

              "_id.day":
                -1,
            },
          },
        ]);

      return res.status(200).json({
        success: true,
        data:
          sales,
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
  getSalesOverview,
  getProfitAnalytics,
  getTopProducts,
  getPaymentAnalytics,
  getMonthlySales,
  getDailySales,
};