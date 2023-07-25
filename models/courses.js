const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "please add a course title"],
  },

  description: {
    type: String,
    required: [true, "please add a description"],
  },

  weeks: {
    type: Number,
    required: [true, "please add number of weeks"],
  },

  tuition: {
    type: Number,
    required: [true, "please add a number"],
  },

  minimunSkill: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
    strictPopulate: true,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
