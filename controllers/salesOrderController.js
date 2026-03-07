const SalesOrder = require("../models/SalesOrder");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");

// Get all sales orders
exports.getAllSalesOrders = async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find().populate("items.productId");

    res.json({
      error: false,
      salesOrders,
      message: "All sales orders fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};

// Get sales order by ID
exports.getSalesOrderById = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id).populate(
      "items.productId",
    );

    if (!salesOrder) {
      return res.status(404).json({
        error: true,
        message: "Sales order not found",
      });
    }

    res.json({
      error: false,
      salesOrder,
      message: "Sales order fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};

// Create sales order
exports.createSalesOrder = async (req, res) => {
  try {
    const { customerName, items } = req.body;

    // Validation
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Customer name and items are required",
      });
    }

    // Validate stock availability before creating sales order
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          error: true,
          message: `Product with ID ${item.productId} not found`,
        });
      }

      // Check if enough stock exists
      if (product.currentStock < item.quantity) {
        // use clear wording to help front‑end display "out of stock"
        return res.status(400).json({
          error: true,
          message: `Out of stock for product \"${product.name}\". Available: ${product.currentStock}, Requested: ${item.quantity}`,
        });
      }
    }

    const salesOrder = await SalesOrder.create({
      customerName,
      items,
      status: "Pending",
    });

    const populatedSO = await salesOrder.populate("items.productId");

    res.status(201).json({
      error: false,
      salesOrder: populatedSO,
      message: "Sales order created successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};

// Update sales order status and decrement stock
exports.updateSalesOrder = async (req, res) => {
  try {
    const { status, items } = req.body;
    const salesOrderId = req.params.id;

    const salesOrder = await SalesOrder.findById(salesOrderId);

    if (!salesOrder) {
      return res.status(404).json({
        error: true,
        message: "Sales order not found",
      });
    }

    // If the caller is attempting to update the items (e.g. change quantities)
    // make sure no item exceeds the available stock. This catches cases where
    // the user edits a pending order and requests more than is available.
    if (items && items.length) {
      for (let item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            error: true,
            message: `Product with ID ${item.productId} not found`,
          });
        }
        if (product.currentStock < item.quantity) {
          return res.status(400).json({
            error: true,
            message: `Out of stock for product \"${product.name}\". Available: ${product.currentStock}, Requested: ${item.quantity}`,
          });
        }
      }
    }

    // If status is being changed to "Delivered", decrease stock
    if (status === "Delivered" && salesOrder.status !== "Delivered") {
      // Verify stock is still available before decreasing
      for (let item of salesOrder.items) {
        const product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            error: true,
            message: `Product with ID ${item.productId} not found`,
          });
        }

        if (product.currentStock < item.quantity) {
          return res.status(400).json({
            error: true,
            message: `Out of stock for product \"${product.name}\". Available: ${product.currentStock}, Required: ${item.quantity}`,
          });
        }
      }

      // Decrease stock for all items using $inc operator
      for (let item of salesOrder.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { currentStock: -item.quantity } },
          { new: true },
        );
      }

      // Create invoice for the sales order
      let totalAmount = 0;
      for (let item of salesOrder.items) {
        totalAmount += item.price * item.quantity;
      }

      await Invoice.create({
        salesOrderId: salesOrderId,
        totalAmount: totalAmount,
        GST: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paid: false,
      });
    }

    // Update the sales order
    const updatedSO = await SalesOrder.findByIdAndUpdate(
      salesOrderId,
      { status: status || salesOrder.status, items: items || salesOrder.items },
      { new: true, runValidators: true },
    ).populate("items.productId");

    res.json({
      error: false,
      salesOrder: updatedSO,
      message:
        status === "Delivered"
          ? "Sales order delivered and stock updated successfully"
          : "Sales order updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};

// Delete sales order
exports.deleteSalesOrder = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByIdAndDelete(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({
        error: true,
        message: "Sales order not found",
      });
    }

    res.json({
      error: false,
      message: "Sales order deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};

// Get invoice associated with a specific sales order
exports.getInvoiceForSalesOrder = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      salesOrderId: req.params.id,
    }).populate("salesOrderId");
    if (!invoice) {
      return res.status(404).json({
        error: true,
        message: "Invoice not found for this sales order",
      });
    }
    res.json({
      error: false,
      invoice,
      message: "Invoice fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};
