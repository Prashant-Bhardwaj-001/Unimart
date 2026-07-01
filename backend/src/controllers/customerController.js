const Customer = require("../models/Customer");

/*
--------------------------------------------------------
GET ALL CUSTOMERS / LIVE SEARCH NODES (UPDATED LOGIC)
--------------------------------------------------------
*/
const getCustomers = async (req, res) => {
  try {
    let query = {};

    // FIXED: Agar frontend se query parameters me ?search= aaya h toh query filter build hoga
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i"); // 'i' flag matches case-insensitive strings
      
      query = {
        $or: [
          { name: searchRegex },
          { phone: searchRegex }
        ]
      };
    }

    // Filter apply hone ke baad latest records sorting layout sequence standard mapping
    const customers = await Customer.find(query).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
--------------------------------------------------------
GET CUSTOMER BY PHONE
--------------------------------------------------------
*/
const getCustomerByPhone = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      phone: req.params.phone,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
--------------------------------------------------------
CREATE NEW CUSTOMER
--------------------------------------------------------
*/
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    const existingCustomer = await Customer.findOne({
      phone,
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists",
      });
    }

    const customer = await Customer.create({
      customerCode: `CUS-${Date.now()}`,
      name,
      phone,
      email,
    });

    return res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
--------------------------------------------------------
UPDATE CUSTOMER METADATA
--------------------------------------------------------
*/
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer Not Found",
      });
    }

    customer.name = req.body.name || customer.name;
    customer.email = req.body.email || customer.email;

    await customer.save();

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
};