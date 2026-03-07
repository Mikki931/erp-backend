const Invoice = require("../models/Invoice");

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.salesOrderId) {
      filter.salesOrderId = req.query.salesOrderId;
    }
    const invoices = await Invoice.find(filter).populate("salesOrderId");

    // always return array; do not fail on empty
    res.json({
      error: false,
      invoices,
      message: "All invoices fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "salesOrderId",
    );

    if (!invoice) {
      return res.status(404).json({
        error: true,
        message: "Invoice not found",
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

// Create invoice
exports.createInvoice = async (req, res) => {
  try {
    const { salesOrderId, totalAmount, GST, dueDate } = req.body;

    // Validation
    if (!salesOrderId || !totalAmount) {
      return res.status(400).json({
        error: true,
        message: "Sales order ID and total amount are required",
      });
    }

    const invoice = await Invoice.create({
      salesOrderId,
      totalAmount,
      GST: GST || 0,
      dueDate: dueDate || new Date(),
      paid: false,
    });

    const populatedInvoice = await invoice.populate("salesOrderId");

    res.status(201).json({
      error: false,
      invoice: populatedInvoice,
      message: "Invoice created successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("salesOrderId");

    if (!invoice) {
      return res.status(404).json({
        error: true,
        message: "Invoice not found",
      });
    }

    res.json({
      error: false,
      invoice,
      message: "Invoice updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        error: true,
        message: "Invoice not found",
      });
    }

    res.json({
      error: false,
      message: "Invoice deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Some error occurred",
      details: err.message,
    });
  }
};
