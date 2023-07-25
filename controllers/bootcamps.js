const path = require("path");
const ErrorResponse = require("../utills/errorResponse");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");

//@desc  get all bootcamps
//@route get/api/v1/bootcamps
//@access public

exports.getBookcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res.status(200).json({
    success: true,
    data: bootcamps,
  });
});

//@desc  get single bootcamps
//@route get/api/v1/bootcamps/:id
//@access public

exports.getBookcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc  create new bootcamp
//@route get/api/v1/bootcamps/:id
//@access private

exports.createBookcamp = asyncHandler(async (req, res, next) => {
  //Add user to req,body
  req.body.user = req.user.id;

  //check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if user is not an admin, they can only add one bootcamp

  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErroResponse(
        `the user with id ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@desc  update single bootcamps
//@route get/api/v1/bootcamps/:id
//@access private

exports.updateBookcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc  delete single bootcamps
//@route get/api/v1/bootcamps/:id
//@access private

exports.deleteBookcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.bootcampId}`),
      404
    );
  }

  if (!req.files) {
    return next(
      new ErrorResponse(`please upload Picture File 0f not more than 20mb`, 400)
    );
  }

  const file = req.files.file;

  // make sure the image is a photo

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`please upload an image file`, 400));
  }

  // check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `please upload an image file less than ${process.env.MAX_FILE_UPLOAD} `,
        400
      )
    );
  }

  //create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
  console.log(file.name);
});
