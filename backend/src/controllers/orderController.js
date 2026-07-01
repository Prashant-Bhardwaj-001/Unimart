const Product = require("../models/Product");
const Order = require("../models/Order");
const StockTransaction = require("../models/StockTransaction");
const Customer = require("../models/Customer");

// ========================================================
// 1. Search Products by Name, Barcode, or SKU
// ========================================================
const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { barcode: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } }
        ]
      };
    }

    const products = await Product.find(query).limit(10); // Performance optimized
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// 2. Verified Customer Lookup via Phone (समाधान - फ्रंटएंड एरर फिक्स)
// ========================================================
const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone || phone.trim() === "") {
      return res.status(400).json({ success: false, message: "Phone number parameter is required." });
    }

    // डेटाबेस में फोन नंबर ढूंढें
    const customer = await Customer.findOne({ phone: phone.trim() });

    // अगर कस्टमर नहीं मिला तो फ्रंटएंड 404 ब्लॉक में कैच करेगा और 'New Customer' मोड खोलेगा
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: "This mobile number is not registered in the database logs." 
      });
    }

    // कस्टमर मिलने पर 200 OK के साथ डेटा भेजें
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// 3. Create Order with 20:1 Loyalty Redemption Logic
// ========================================================
const createOrder = async (req, res) => {
  try {
    const {
      items,
      customerPhone,
      customerName, 
      paymentMethod,
      discount = 0,
      pointsRedeemed = 0, // FRONTEND से रिडीम करने के लिए भेजे गए पॉइंट्स
    } = req.body;

    // CRITICAL: Strict validation for customer phone number
    if (!customerPhone || customerPhone.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Customer mobile number is mandatory for POS Billing.",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart items cannot be empty." });
    }

    let subTotal = 0;
    let taxAmount = 0;
    const orderItems = [];

    // Loop through items to calculate totals and update stock
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product Not Found" });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} Out Of Stock (Available: ${product.stockQuantity})`,
        });
      }

      const lineTotal = product.sellingPrice * item.quantity;
      const lineTax = (lineTotal * product.taxPercentage) / 100;

      subTotal += lineTotal;
      taxAmount += lineTax;

      orderItems.push({
        product: product._id,
        productName: product.name,
        barcode: product.barcode,
        quantity: item.quantity,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        taxPercentage: product.taxPercentage,
        total: lineTotal,
      });

      const previousStock = product.stockQuantity;
      product.stockQuantity -= item.quantity;

      await product.save();

      await StockTransaction.create([
        {
          product: product._id,
          transactionType: "STOCK_OUT",
          quantity: item.quantity,
          previousStock,
          newStock: product.stockQuantity,
          remarks: "POS Sale",
          performedBy: req.user._id,
        },
      ]);
    }

    // 🌟 BUSINESS LOGIC: 20 Loyalty Points = ₹1 Cash Discount
    let loyaltyDiscountAmount = 0;
    if (pointsRedeemed > 0) {
      loyaltyDiscountAmount = Math.floor(pointsRedeemed / 20);
    }

    // ग्रैंड टोटल में से मैन्युअल डिस्काउंट और लॉयल्टी डिस्काउंट दोनों माइनस होंगे
    const grandTotal = subTotal + taxAmount - discount - loyaltyDiscountAmount;

    /* CUSTOMER + LOYALTY UPDATED PIPELINE */
    let customer = await Customer.findOne({ phone: customerPhone });

    if (!customer) {
      // अगर कस्टमर नहीं मिला, तो नया कस्टमर फ्रंटएंड से भेजे गए 'customerName' के साथ बनेगा
      const newCustomer = await Customer.create([
        {
          customerCode: `CUS-${Date.now()}`,
          phone: customerPhone,
          name: customerName || "Walk-In Customer",
        },
      ]);
      customer = newCustomer[0];
    } else if (customerName && customer.name === "Walk-In Customer") {
      // अगर पहले 'Walk-In Customer' नाम सेव था, तो उसे सही नाम से अपडेट कर देंगे
      customer.name = customerName;
    }

    // 1. अगर कस्टमर ने पॉइंट्स रिडीम किए हैं, तो उसके प्रोफाइल से वो पॉइंट्स घटाओ
    if (pointsRedeemed > 0) {
      // पॉइंट्स को माइनस में जाने से रोकने के लिए Math.max का यूज़ किया है
      customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - pointsRedeemed);
    }

    // 2. इस करंट बिल के अमाउंट पर नए पॉइंट्स अर्न करवाओ (₹100 की खरीद पर 1 पॉइंट)
    const currentBillTotal = grandTotal > 0 ? grandTotal : 0;
    const loyaltyPointsEarned = Math.floor(currentBillTotal / 100);
    
    customer.loyaltyPoints += loyaltyPointsEarned;
    customer.totalSpent += currentBillTotal;
    customer.totalOrders += 1;
    customer.lastPurchaseDate = new Date();

    await customer.save();

    const orderNumber = `ORD-${Date.now()}`;

    // डेटाबेस में नया ऑर्डर डॉक्यूमेंट क्रिएट करना
    const order = await Order.create([
      {
        orderNumber,
        items: orderItems,
        customerPhone,
        customer: customer._id,
        loyaltyPointsEarned,
        subTotal,
        discount: discount + loyaltyDiscountAmount, // टोटल डिस्काउंट का सम
        taxAmount,
        grandTotal: currentBillTotal,
        paymentMethod,
        cashier: req.user._id,
      },
    ]);

    // फ्रंटएंड पर थर्मल रिसिप्ट प्रिंटिंग के लिए डेटा पॉपुलेट करना
    const populatedOrder = await Order.findById(order[0]._id)
      .populate("cashier", "name")
      .populate("customer", "name phone loyaltyPoints");

    // फ्रंटएंड को रिस्पांस में रिडीम किए गए पॉइंट्स का मेटाडेटा ऑब्जेक्ट में मिक्स करके भेजना
    const responseData = populatedOrder.toObject();
    responseData.pointsRedeemed = pointsRedeemed;
    responseData.cashDiscountFromPoints = loyaltyDiscountAmount;

    return res.status(201).json({
      success: true,
      message: "Order Created Successfully",
      data: responseData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// 4. Get All Orders
// ========================================================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("cashier", "name role")
      .populate("customer", "name phone loyaltyPoints")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// 5. Get Order By ID
// ========================================================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cashier", "name role")
      .populate("customer", "name phone loyaltyPoints")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order Not Found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  createOrder,
  getOrders,
  getOrderById,
  getCustomerByPhone,
};