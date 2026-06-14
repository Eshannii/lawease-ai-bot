import User from "../models/User.js";

// GET /api/chat-history/load
export const loadHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+chatHistory");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ chats: user.chatHistory || [] });
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

    await User.findByIdAndUpdate(req.user.id, {
      chatHistory: chats,
      chatUpdatedAt: new Date(),
    });

    res.json({ success: true, saved: chats.length });
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
