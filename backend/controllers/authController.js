const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const userModel = require("../models/userModel");

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, account_type = "free", location } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const hash = await bcrypt.hash(password, 10);
  const userId = await userModel.createUser({
    name,
    email,
    password: hash,
    role: "user",
    account_type,
    location
  });

  const user = await userModel.findById(userId);
  return res.status(201).json({ message: "Signup successful", user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      location: user.location
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      location: user.location
    }
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  return res.json(user);
});

module.exports = {
  signup,
  login,
  me
};
