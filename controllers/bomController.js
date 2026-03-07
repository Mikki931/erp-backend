const BOM = require("../models/BOM");
const { sendError } = require("../utils/errorHandler");
const Product = require("../models/Product");

// Get all BOMs
exports.getAllBOMs = async (req, res) => {
  try {
    const boms = await BOM.find()
      .populate("finishedProductId")
      .populate("materials.productId");

    // always return array, even if empty. 404 was causing the frontend to
    // treat a "no results" situation as an error and display
    // "Failed to fetch BOMs".  downstream callers expect an array.
    res.json({
      error: false,
      boms,
      message: "All BOMs fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Get BOM by ID
exports.getBOMById = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate("finishedProductId")
      .populate("materials.productId");

    if (!bom) {
      return res.status(404).json({
        error: true,
        message: "BOM not found",
      });
    }

    res.json({
      error: false,
      bom,
      message: "BOM fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Create BOM
exports.createBOM = async (req, res) => {
  try {
    const { finishedProductId, materials } = req.body;

    // Validation
    if (!finishedProductId || !materials || materials.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Finished product ID and materials list are required",
      });
    }

    const bom = await BOM.create({ finishedProductId, materials });

    const populatedBOM = await bom
      .populate("finishedProductId")
      .populate("materials.productId");

    res.status(201).json({
      error: false,
      bom: populatedBOM,
      message: "BOM created successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Update BOM
exports.updateBOM = async (req, res) => {
  try {
    const bom = await BOM.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("finishedProductId")
      .populate("materials.productId");

    if (!bom) {
      return res.status(404).json({
        error: true,
        message: "BOM not found",
      });
    }

    res.json({
      error: false,
      bom,
      message: "BOM updated successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Delete BOM
exports.deleteBOM = async (req, res) => {
  try {
    const bom = await BOM.findByIdAndDelete(req.params.id);

    if (!bom) {
      return res.status(404).json({
        error: true,
        message: "BOM not found",
      });
    }

    res.json({
      error: false,
      message: "BOM deleted successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Manufacture products using a BOM.
// body: { bomId, quantity }
exports.manufactureProduct = async (req, res) => {
  try {
    const { bomId, quantity } = req.body;
    if (!bomId || !quantity || quantity <= 0) {
      return res.status(400).json({
        error: true,
        message: "bomId and positive quantity are required",
      });
    }

    const bom = await BOM.findById(bomId);
    if (!bom) {
      return res.status(404).json({
        error: true,
        message: "BOM not found",
      });
    }

    // check raw material availability
    for (let mat of bom.materials) {
      const prod = await Product.findById(mat.productId);
      if (!prod) {
        return res.status(404).json({
          error: true,
          message: `Material product ${mat.productId} not found`,
        });
      }
      const required = mat.quantity * quantity;
      if (prod.currentStock < required) {
        return res.status(400).json({
          error: true,
          message: `Insufficient stock for material ${prod.name}`,
        });
      }
    }

    // decrement materials
    for (let mat of bom.materials) {
      await Product.findByIdAndUpdate(mat.productId, {
        $inc: { currentStock: -mat.quantity * quantity },
      });
    }

    // increment finished product
    await Product.findByIdAndUpdate(bom.finishedProductId, {
      $inc: { currentStock: quantity },
    });

    res.json({ error: false, message: "Manufacture successful" });
  } catch (err) {
    res
      .status(500)
      .json({
        error: true,
        message: "Some error occurred",
        details: err.message,
      });
  }
};
