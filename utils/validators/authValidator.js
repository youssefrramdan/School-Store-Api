import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";


/**
 * @desc    Login Validation Rules
 */
export const loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  check("password").notEmpty().withMessage("Password is required"),

  validatorMiddleware,
];
