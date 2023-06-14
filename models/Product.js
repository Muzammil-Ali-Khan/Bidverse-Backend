const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    endTime: {
      type: Date,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      required: true,
    },
    bidAmounts: {
      type: [Object],
      default: [],
    },
    category: {
      type: String,
      required: true,
      enum: ["Fashion", "Electronics", "Furnitures", "Others"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
