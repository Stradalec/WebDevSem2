const mongoose = require('mongoose');
const { courseSchema } = require('./schemas/course.schema');
const { lessonSchema } = require('./schemas/lesson.schema');

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

module.exports = {Course, Lesson};