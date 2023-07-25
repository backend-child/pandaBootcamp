const ErrorResponse = require("../utills/errorResponse");
const Course = require("../models/courses");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");

//@desc  get all courses
//@route get/api/v1/courses
//@route get/api/v1/bootcamps/:id/courses
//@access public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: "bootcamp",
      select: "name description",
      strictPopulate: true,
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

//@desc  get a single course
//@route get/api/v1/courses/:id
//@route get/api/v1/bootcamps/:id/courses
//@access public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,

    data: course,
  });
});

// add course route
// Get /api/v1/bootcamps/:bootcampId/courses
//private

exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,

    data: course,
  });
});

// update course
// Put /api/v1/courses
//private /api/v1/courses/:id
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let preCourse = await Course.findById(req.params.id);

  if (!preCourse) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.bootcampId}`),
      404
    );
  }

  preCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,

    data: course,
  });
});

// delete course
// delete /api/v1/courses
//private /api/v1/courses/:id
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.bootcampId}`),
      404
    );
  }

  bootcamp.remove();

  res.status(200).json({
    success: true,

    data: {},
  });
});

// upload
// put /api/v1/courses
//private /api/v1/bootcamp/:id
