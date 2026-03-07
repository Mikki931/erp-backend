const Product = require("../models/Product");
const { sendError } = require("../utils/errorHandler");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({
        error: true,
        message: "No products found",
      });
    }

    res.json({
      error: false,
      products,
      message: "All products fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    res.json({
      error: false,
      product,
      message: "Product fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, SKU, type, price, currentStock } = req.body;

    // Validation
    if (!name || !SKU) {
      return res.status(400).json({
        error: true,
        message: "Name and SKU are required",
      });
    }

    const product = await Product.create({
      name,
      SKU,
      type: type || "raw",
      price: price || 0,
      currentStock: currentStock || 0,
    });

    res.status(201).json({
      error: false,
      product,
      message: "Product created successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    res.json({
      error: false,
      product,
      message: "Product updated successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    res.json({
      error: false,
      product,
      message: "Product deleted successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};
