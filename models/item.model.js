import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [2, "Item name must be at least 2 characters"],
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["tools", "books"],
        message: "Category must be either 'tools' or 'books'",
      },
    },
    // For books only - branch and level
    branch: {
      type: String,
      enum: {
        values: ["kindergarten", "preparatory", "middle", "secondary"],
        message:
          "Branch must be one of: kindergarten, preparatory, middle, secondary",
      },
      required: function () {
        return this.category === "books";
      },
    },
    level: {
      type: String,
      required: function () {
        return this.category === "books";
      },
      validate: {
        validator: function (value) {
          if (this.category !== "books") return true;

          const validLevels = {
            kindergarten: ["KG1", "KG2"],
            preparatory: ["Prep1", "Prep2", "Prep3"],
            middle: ["Middle1", "Middle2", "Middle3"],
            secondary: ["Secondary1", "Secondary2", "Secondary3"],
          };

          return validLevels[this.branch]?.includes(value);
        },
        message: "Invalid level for the selected branch",
      },
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Item image is required"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    // Additional fields for better management
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    // Create indexes for better query performance
    indexes: [
      { category: 1 },
      { branch: 1, level: 1 },
      { inStock: 1 },
      { createdAt: -1 },
    ],
  }
);

// Pre-save middleware to handle stock status
itemSchema.pre("save", function (next) {
  if (this.quantity === 0) {
    this.inStock = false;
  } else if (this.quantity > 0) {
    this.inStock = true;
  }
  next();
});

// Static method to get valid levels for a branch
itemSchema.statics.getValidLevels = function (branch) {
  const validLevels = {
    kindergarten: ["KG1", "KG2"],
    preparatory: ["Prep1", "Prep2", "Prep3"],
    middle: ["Middle1", "Middle2", "Middle3"],
    secondary: ["Secondary1", "Secondary2", "Secondary3"],
  };
  return validLevels[branch] || [];
};

// Instance method to get full level description
itemSchema.methods.getFullLevelDescription = function () {
  if (this.category === "tools") {
    return "N/A";
  }
  return `${this.branch.charAt(0).toUpperCase() + this.branch.slice(1)} - ${this.level}`;
};

export default mongoose.model("Item", itemSchema);
