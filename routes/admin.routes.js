import express from "express";
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/admin.controller.js";
import {
  getAllUsers,
  getSpecificUser,
  createUser,
  deleteUser,
  updateMe,
  updateUserImage,
  updateMyPassword,
} from "../controllers/user.controller.js";
import createUploader from "../middlewares/uploadImageMiddleware.js";
import { protectedRoutes } from "../controllers/auth.controller.js";

const adminRouter = express.Router();
const upload = createUploader("image");

// Admin item management routes
adminRouter
  .route("/items")
  .get(getAllItems)
  .post(protectedRoutes, upload.single("image"), createItem);
adminRouter
  .route("/items/:id")
  .patch(protectedRoutes, upload.single("image"), updateItem)
  .delete(protectedRoutes, deleteItem);

// Admin user management routes
adminRouter.route("/users").get(protectedRoutes, getAllUsers).post(createUser);
adminRouter
  .route("/users/:id")
  .get(protectedRoutes, getSpecificUser)
  .delete(protectedRoutes, deleteUser);

// Admin profile management routes
adminRouter.route("/profile/updateMe").patch(protectedRoutes, updateMe);
adminRouter
  .route("/profile/updateImage")
  .patch(protectedRoutes, upload.single("profileImage"), updateUserImage);
adminRouter
  .route("/profile/updatePassword")
  .patch(protectedRoutes, updateMyPassword);

export default adminRouter;
