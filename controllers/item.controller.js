import asyncHandler from "express-async-handler";
import Item from "../models/item.model.js";
import ApiError from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";

/**
 * @desc    Get all items with filtering, search, and pagination
 * @route   GET /api/v1/items
 * @access  Public
 * @params  keyword, category, branch, level, price[gte], price[lte], sort, fields, page, limit
 */
const getAllItems = asyncHandler(async (req, res) => {
  const baseQuery = Item.find({ inStock: true });

  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .search(["itemName", "description"])
    .sort()
    .limitFields(); 

  // Apply pagination
  await features.paginate();

  // Execute the query
  const items = await features.mongooseQuery;
  const paginationResult = features.getPaginationResult();

  res.status(200).json({
    message: "success",
    pagination: paginationResult,
    results: items.length,
    data: items,
  });
});

/**
 * @desc    Get specific item by ID
 * @route   GET /api/v1/items/:id
 * @access  Public
 */
const getSpecificItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const item = await Item.findById(id).populate("createdBy", "name");

  if (!item) {
    return next(new ApiError(`No item found with id ${id}`, 404));
  }

  res.status(200).json({
    message: "success",
    data: item,
  });
});

export { getAllItems, getSpecificItem };
