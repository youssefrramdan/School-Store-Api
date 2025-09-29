import express from "express";
import {
  getAllItems,
  getSpecificItem,
} from "../controllers/item.controller.js";

const itemRouter = express.Router();

// Simple routes - only two endpoints needed
itemRouter.route("/").get(getAllItems);
itemRouter.route("/:id").get(getSpecificItem);

export default itemRouter;
