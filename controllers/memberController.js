const Member = require("../models/Member");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/errorHandler");

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.secret, {
    expiresIn: "1h",
  });
};

// Member login
exports.loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and password are required",
      });
    }

    const member = await Member.findOne({ email });

    if (!member) {
      // don't reveal whether email exists
      return res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, member.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(member._id, member.role);

    res.json({
      error: false,
      message: "Login successful",
      token: token,
      _id: member._id,
      email: member.email,
      name: member.name,
      role: member.role,
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Member registration
exports.registerMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "Name, email, and password are required",
      });
    }

    // Check if member already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        error: true,
        message: "Member with this email already exists",
      });
    }

    // Determine role assignment: public signups always 'sales'
    // if an admin is creating via Authorization header, allow provided role
    let assignedRole = "sales";
    if (role && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.secret);
        if (decoded.role === "admin") {
          assignedRole = role;
        }
      } catch (e) {
        // ignore errors, keep default role
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const member = await Member.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    res.status(201).json({
      error: false,
      message: "Member registered successfully",
      newMember: {
        _id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
      },
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().select("-password");

    res.json({
      error: false,
      members,
      message: "All members fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).select("-password");

    if (!member) {
      return res.status(404).json({
        error: true,
        message: "Member not found",
      });
    }

    res.json({
      error: false,
      member,
      message: "Member fetched successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!member) {
      return res.status(404).json({
        error: true,
        message: "Member not found",
      });
    }

    res.json({
      error: false,
      member,
      message: "Member updated successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// Delete member
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({
        error: true,
        message: "Member not found",
      });
    }

    res.json({
      error: false,
      message: "Member deleted successfully",
    });
  } catch (err) {
    sendError(res, err);
  }
};
