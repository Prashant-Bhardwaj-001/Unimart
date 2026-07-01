const Product = require(
  "../models/Product"
);

const PurchaseOrder = require(
  "../models/PurchaseOrder"
);

/*
==================================
LOW STOCK ALERTS
==================================
*/

const getLowStockProducts =
  async (req, res) => {
    try {
      const products =
        await Product.find({
          $expr: {
            $lte: [
              "$stockQuantity",
              "$lowStockThreshold",
            ],
          },
          isActive: true,
        })
          .populate(
            "supplier",
            "companyName supplierCode"
          )
          .sort({
            stockQuantity: 1,
          });

      return res.status(200).json({
        success: true,
        count:
          products.length,
        data: products,
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
EXPIRY ALERTS
==================================
*/

const getExpiringProducts =
  async (req, res) => {
    try {
      const today =
        new Date();

      const next30Days =
        new Date();

      next30Days.setDate(
        today.getDate() + 30
      );

      const products =
        await Product.find({
          expiryDate: {
            $gte: today,
            $lte: next30Days,
          },

          isActive: true,
        })
          .populate(
            "supplier",
            "companyName supplierCode"
          )
          .sort({
            expiryDate: 1,
          });

      return res.status(200).json({
        success: true,
        count:
          products.length,
        data: products,
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
OUT OF STOCK
==================================
*/

const getOutOfStockProducts =
  async (req, res) => {
    try {
      const products =
        await Product.find({
          stockQuantity: 0,
          isActive: true,
        })
          .populate(
            "supplier",
            "companyName supplierCode"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count:
          products.length,
        data: products,
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
REORDER SUGGESTIONS
==================================
*/

const getReorderSuggestions =
  async (req, res) => {
    try {
      const products =
        await Product.find({
          $expr: {
            $lte: [
              "$stockQuantity",
              "$reorderLevel",
            ],
          },
          isActive: true,
        })
          .populate(
            "supplier",
            "companyName supplierCode"
          );

      const suggestions =
        products.map(
          (product) => ({
            productId:
              product._id,

            productName:
              product.name,

            currentStock:
              product.stockQuantity,

            reorderLevel:
              product.reorderLevel,

            suggestedOrderQty:
              product.reorderQuantity,

            supplier:
              product.supplier,
          })
        );

      return res.status(200).json({
        success: true,
        count:
          suggestions.length,
        data: suggestions,
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
ALERT SUMMARY
==================================
*/

const getAlertSummary =
  async (req, res) => {
    try {
      const today =
        new Date();

      const next30Days =
        new Date();

      next30Days.setDate(
        today.getDate() + 30
      );

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

      const expiringCount =
        await Product.countDocuments(
          {
            expiryDate: {
              $gte: today,
              $lte:
                next30Days,
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

      return res.status(200).json({
        success: true,

        data: {
          lowStockCount,

          expiringCount,

          outOfStockCount,

          pendingPOCount,
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
  getLowStockProducts,
  getExpiringProducts,
  getOutOfStockProducts,
  getReorderSuggestions,
  getAlertSummary,
};