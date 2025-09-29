import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .search(["name", "email"])
    .sort()
    .limitFields();

  await features.paginate();

  const users = await features.mongooseQuery;
  const paginationResult = features.getPaginationResult();

  res.status(200).json({
    message: "success",
    pagination: paginationResult,
    results: users.length,
    data: users,
  });
});

/**
 * @desc    Get specific user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
const getSpecificUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new ApiError(`There isn't a user for this ${id}`, 404));
  }

  res.status(200).json({ message: "success", user: user });
});
/**
 * @desc    Create a new user
 * @route   POST /api/v1/users
 * @access  Private
 */
const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ message: "success", user: user });
});

/**
 * @desc    Delete an existing user
 * @route   DELETE /api/v1/users/:id
 * @access  Private
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find user first to check if exists
  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError(`There isn't a user for this ${id}`, 404));
  }

  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    message: "success",
  });
});

/**
 * @desc    Update Logged-in User Data
 * @route   PATCH /api/v1/users/updateMe
 * @access  Private (User only)
 */
const updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.oldPassword) {
    return next(new ApiError("This route is not for password updates", 400));
  }

  if (req.body.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      return next(
        new ApiError("Email already exists. Please use a different one.", 400)
      );
    }
  }
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password -__v");

  res.status(200).json({
    message: "success",
    user,
  });
});

const updateUserImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("please upload imageCover", 404));
  }
  req.body.profileImage = req.file.path;
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    message: "success",
    user,
  });
});
/**
 * @desc    Update Logged-in User Password
 * @route   PATCH /api/v1/users/updateMyPassword
 * @access  Private (User)
 */
const updateMyPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ApiError("enter both old and new passwords", 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return next(new ApiError("Incorrect old password", 400));
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();

  await user.save();

  res.status(200).json({ message: "success" });
});

export {
  getAllUsers,
  getSpecificUser,
  createUser,
  deleteUser,
  updateMe,
  updateUserImage,
  updateMyPassword,
};
