const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const User = require("../../models/User");
const mongoose = require("mongoose");

router.post("/createProduct", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "image",
    "description",
    "price",
    "endTime",
    "isFeatured",
    "category",
  ];
  const isValidOperations = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperations) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid API Paramaters" });
  }

  // check empty body
  if (Object.keys(req.body).length < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  let { name, image, description, price, endTime, isFeatured, category } =
    req.body;
  const { id } = req.user;

  try {
    const product = await new Product({
      name,
      image,
      description,
      price,
      userId: id,
      endTime,
      isFeatured,
      category,
    });

    await product.save();

    const payload = {
      product: {
        name,
        image,
        description,
        price,
        userId: id,
        endTime,
        isFeatured,
        category,
      },
    };

    return res.json({
      success: true,
      payload,
      message: "Product created successfully",
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findById(id);
    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findByIdAndDelete(id);
    return res.json({
      success: true,
      product,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/updateBidList", async (req, res) => {
  const { productId, bidAmount, userId } = req.body;

  try {
    const product = await Product.findById(productId);

    if (product) {
      const bidAmounts = [...product.bidAmounts, { userId, amount: bidAmount }];
      const updatedProduct = await Product.findByIdAndUpdate(
        { _id: productId },
        { bidAmounts },
        { new: true }
      );
      return res.json({
        success: true,
        updatedProduct,
        message: "Bid made Successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Product does not exist",
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/favourites/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById({ _id: userId });
    const products = await Product.find({
      _id: {
        $in: user.favourites.map((item) => mongoose.Types.ObjectId(item)),
      },
    });
    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/userProducts/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const products = await Product.find({
      userId,
    });
    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/userBiddedProducts/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const products = await Product.find({
      "bidAmounts.userId": userId,
    });

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
