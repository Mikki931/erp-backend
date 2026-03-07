function sendError(res, err, status = 500) {
  let message = err.message || "An error occurred";
  // mongoose validation errors => aggregate messages
  if (err.name === "ValidationError" && err.errors) {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }
  return res.status(status).json({ error: true, message, details: err.message });
}

module.exports = { sendError };