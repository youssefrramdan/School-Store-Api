import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

dotenv.config();

/**
 * @desc    Generate JWT Token
 */
const generateToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

/**
 * @desc    User Login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  const token = generateToken(user._id);
  res.status(200).json({
    message: "success",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
});

/**
 * @desc    Protect Routes - تأمين الوصول للراوتات
 * @route   Middleware
 * @access  Private
 */
const protectedRoutes = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please log in to access this route",
        401
      )
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token no longer exists", 401)
    );
  }
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError("User recently changed password. Please login again.", 401)
      );
    }
  }

  req.user = currentUser;
  next();
});

export { login, protectedRoutes };
