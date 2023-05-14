const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");

router.post("/createProduct", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "image", "description", "price"];
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

  let { name, image, description, price } = req.body;
  const { id } = req.user;

  try {
    const product = await new Product({
      name,
      image,
      description,
      price,
      userId: id,
    });

    await product.save();

    const payload = {
      product: {
        name,
        image,
        description,
        price,
        userId: id,
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

module.exports = router;
