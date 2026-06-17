import User from "../models/User.js";
import { encrypt, decrypt } from "../utils/encryption.js";

// GET /api/chat-history/load
export const loadHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+chatHistory");
    if (!user) return res.status(404).json({ message: "User not found" });

    const encKey = Buffer.from(req.user.encKey, "hex");

    const decryptedChats = (user.chatHistory || []).map((chat) => ({
      ...chat.toObject(),
      messages: chat.messages.map((m) => {
        try {
          return { role: m.role, content: decrypt(m.content, encKey) };
        } catch {
          return { role: m.role, content: m.content }; // already plaintext (old data)
        }
      }),
    }));

    res.json({ chats: decryptedChats });
  } catch (err) {
    console.error("Load history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/chat-history/save
export const saveHistory = async (req, res) => {
  try {
    const { chats } = req.body;
    if (!Array.isArray(chats))
      return res.status(400).json({ message: "chats must be an array" });

    const encKey = Buffer.from(req.user.encKey, "hex");

    const encryptedChats = chats.map((chat) => ({
      ...chat,
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: encrypt(m.content, encKey),
      })),
    }));

    await User.findByIdAndUpdate(req.user.id, {
      chatHistory: encryptedChats,
      chatUpdatedAt: new Date(),
    });

    res.json({ success: true, saved: encryptedChats.length });
  } catch (err) {
    console.error("Save history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/chat-history/delete
export const deleteHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      chatHistory: [],
      chatUpdatedAt: new Date(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
