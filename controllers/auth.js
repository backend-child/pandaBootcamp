const crypto = require("crypto");
const ErrorResponse = require("../utills/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utills/sendMails");
const User = require("../models/User");

//@desc  To Register User
//@route to POST get/api/v1/auth/register
//@access public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //create token
  sendTokenResponse(user, 200, res);

  // res.status(200).json({
  //   success: true,
  //   token,
  // });
});

//@desc  login user
//@route POST get/api/v1/auth/login
//@access public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("invalid credentials", 401));
  }

  // check if password matched
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("invalid credentials", 401));
  }

  //create token
  sendTokenResponse(user, 200, res);

  res.status(200).json({
    success: true,
    token,
  });
});

//@desc  log user out /clear cookie
//@route to get get/api/v1/auth/me
//@access private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// get token from model , create cookie and send response

//@desc  Get current logged in user
//@route to POST get/api/v1/auth/me
//@access private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc  update user details
//@route to put /api/v1/auth/updatedetails
//@access private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc  Update password
//@route to put get/api/v1/auth/updatepassword
//@access private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("password is incorrect"));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc  forgot password
//@route to POST get/api/v1/auth/forgotpassword
//@access public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 404));
  }

  //get our reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are recieving this Email because you have requested the reset of a password.Please provide Your new password bellow.Thank You ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({
      success: true,
      data: "Email Sent",
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }

  console.log(resetToken);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc  Reset password
//@route to POST get/api/v1/auth/resetpassword/:resettoken
//@access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  //set New password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
