const express = require("express");
const {
  getBookcamps,
  getBookcamp,
  createBookcamp,
  updateBookcamp,
  deleteBookcamp,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

// include other resources
const courseRouter = require("./courses");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// re- route into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/").get(getBookcamps).post(protect, createBookcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router
  .route("/:id")
  .get(getBookcamps)
  .put(protect, authorize("publisher", "admin"), updateBookcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBookcamp);

module.exports = router;
