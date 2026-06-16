const mongoose = require('mongoose');
const { imageInfoSchema } = require('./imageInfo.schema');
const courseSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cover: imageInfoSchema,
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    studentsCount: Number,
  },
  {
    timestamps: true,
    collection: 'courses',
  },
);

module.exports = {
  courseSchema
};