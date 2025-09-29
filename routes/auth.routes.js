import express from "express";
import { loginValidator } from "../utils/validators/authValidator.js";
import { login } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.route("/login").post(loginValidator, login);

export default authRouter;
