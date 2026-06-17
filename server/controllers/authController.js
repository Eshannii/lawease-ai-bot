import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { deriveKey, encrypt, decrypt } from "../utils/encryption.js";

import crypto from "crypto"; // top mein add karo

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email and password",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔑 Encryption salt generate karo
    const encryptionSalt = crypto.randomBytes(16).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      encryptionSalt, // NEW
      role: "user",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and Password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid Password",
      });
    }

    // 🔑 Encryption key derive karo password + salt se
    const encKey = deriveKey(password, user.encryptionSalt).toString("hex");

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        encKey, // NEW — JWT mein store hoga
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      },
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const verify = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// PUT /api/auth/change-password

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Both current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select(
      "+password +chatHistory",
    );
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Current password is incorrect" });
    }

    // 🔑 Old key se decrypt, new key se re-encrypt
    const oldKey = deriveKey(currentPassword, user.encryptionSalt);
    const newKey = deriveKey(newPassword, user.encryptionSalt); // same salt

    const reEncryptedHistory = (user.chatHistory || []).map((chat) => ({
      ...chat.toObject(),
      messages: chat.messages.map((m) => {
        try {
          const plain = decrypt(m.content, oldKey);
          return { role: m.role, content: encrypt(plain, newKey) };
        } catch {
          return m; // decrypt fail ho to as-is rakho
        }
      }),
    }));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.chatHistory = reEncryptedHistory;
    user.updatedAt = new Date();
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
