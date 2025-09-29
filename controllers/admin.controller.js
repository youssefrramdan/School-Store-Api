import asyncHandler from "express-async-handler";
import Item from "../models/item.model.js";
import ApiError from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";

/**
 * @desc    Get all items for admin management
 * @route   GET /api/v1/admin/items
 * @access  Private (Admin only)
 */
const getAllItems = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Item.find()
      .populate("createdBy", "name email")
      .populate("lastUpdatedBy", "name email"),
    req.query
  )
    .filter()
    .search(["itemName", "description"])
    .sort()
    .limitFields();

  await features.paginate();

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
 * @desc    Create new item
 * @route   POST /api/v1/admin/items
 * @access  Private (Admin only)
 */
const createItem = asyncHandler(async (req, res, next) => {
  // Add the admin who created the item
  req.body.createdBy = req.user._id;

  // Handle image upload
  if (req.file) {
    req.body.image = req.file.path;
  }

  const item = await Item.create(req.body);

  // Populate the created item with user info
  await item.populate("createdBy", "name email");

  res.status(201).json({
    message: "Item created successfully",
    data: item,
  });
});

/**
 * @desc    Update existing item
 * @route   PATCH /api/v1/admin/items/:id
 * @access  Private (Admin only)
 */
const updateItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Add the admin who updated the item
  req.body.lastUpdatedBy = req.user._id;

  // Handle image upload
  if (req.file) {
    req.body.image = req.file.path;
  }

  const item = await Item.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("createdBy lastUpdatedBy", "name email");

  if (!item) {
    return next(new ApiError(`No item found with id ${id}`, 404));
  }

  res.status(200).json({
    message: "Item updated successfully",
    data: item,
  });
});

/**
 * @desc    Delete item
 * @route   DELETE /api/v1/admin/items/:id
 * @access  Private (Admin only)
 */
const deleteItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const item = await Item.findByIdAndDelete(id);

  if (!item) {
    return next(new ApiError(`No item found with id ${id}`, 404));
  }

  res.status(200).json({
    message: "Item deleted successfully",
  });
});

export { getAllItems, createItem, updateItem, deleteItem };
