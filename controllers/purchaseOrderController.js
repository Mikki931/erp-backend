const PurchaseOrder = require("../models/PurchaseOrder");
const { sendError } = require("../utils/errorHandler");
const Product = require("../models/Product");

// Get all purchase orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders =
      await PurchaseOrder.find().populate("items.productId");

    res.json({
      error: false,
      purchaseOrders,
      message: "All purchase orders fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Get purchase order by ID
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id).populate(
      "items.productId",
    );

    if (!purchaseOrder) {
      return res.status(404).json({
        error: true,
        message: "Purchase order not found",
      });
    }

    res.json({
      error: false,
      purchaseOrder,
      message: "Purchase order fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Create purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { vendorName, items } = req.body;

    // Validation
    if (!vendorName || !items || items.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Vendor name and items are required",
      });
    }

    // Validate all products exist
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          error: true,
          message: `Product with ID ${item.productId} not found`,
        });
      }
    }

    const purchaseOrder = await PurchaseOrder.create({
      vendorName,
      items,
      status: "Pending",
    });

    const populatedPO = await purchaseOrder.populate("items.productId");

    res.status(201).json({
      error: false,
      purchaseOrder: populatedPO,
      message: "Purchase order created successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Update purchase order status and increment stock
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { status, items } = req.body;
    const purchaseOrderId = req.params.id;

    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);

    if (!purchaseOrder) {
      return res.status(404).json({
        error: true,
        message: "Purchase order not found",
      });
    }

    // If status is being changed to "Received", update stock
    if (status === "Received" && purchaseOrder.status !== "Received") {
      // Increase stock for all items in the purchase order using $inc operator
      for (let item of purchaseOrder.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { currentStock: item.quantity } },
          { new: true },
        );
      }
    }

    // Update the purchase order
    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      purchaseOrderId,
      {
        status: status || purchaseOrder.status,
        items: items || purchaseOrder.items,
      },
      { new: true, runValidators: true },
    ).populate("items.productId");

    res.json({
      error: false,
      purchaseOrder: updatedPO,
      message:
        status === "Received"
          ? "Purchase order received and stock updated successfully"
          : "Purchase order updated successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Delete purchase order
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        error: true,
        message: "Purchase order not found",
      });
    }

    res.json({
      error: false,
      message: "Purchase order deleted successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};
