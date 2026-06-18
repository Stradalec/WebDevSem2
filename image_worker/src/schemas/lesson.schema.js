const mongoose = require("mongoose");
const { imageInfoSchema } = require("./imageInfo.schema");
const lessonSchema = new mongoose.Schema(
  {
    name: String,
    textContent: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    images: [imageInfoSchema],
    order: Number,
  },
  {
    timestamps: true,
    collection: "lessons",
  },
);

module.exports = {
  lessonSchema,
};
