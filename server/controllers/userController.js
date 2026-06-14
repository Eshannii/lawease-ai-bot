import User from "../models/User.js";

// GET /api/users — All registered users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Access denied. Admins only." });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Get Users Error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// DELETE /api/users/:id — Delete a user (admin only)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Access denied. Admins only." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Admin ko delete nahi kar sakte
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Cannot delete an admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};
