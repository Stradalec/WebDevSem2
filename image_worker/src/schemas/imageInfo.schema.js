const mongoose = require("mongoose");
const imageInfoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ["processing", "ready"],
      default: "processing",
    },
  },
  { _id: false },
);
module.exports = {
  imageInfoSchema,
};
