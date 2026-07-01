require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../models/User");

const createAdmin = async () => {

  await mongoose.connect(
    process.env.MONGO_URI
  );

  const adminExists =
    await User.findOne({
      email: "admin@gmail.com",
    });

  if (adminExists) {

    console.log(
      "Admin Already Exists"
    );

    process.exit();

  }

  await User.create({
    name: "Super Admin",

    email: "admin@gmail.com",

    password: "admin123",

    role: "ADMIN",
  });

  console.log(
    "Admin Created Successfully"
  );

  process.exit();
};

createAdmin();