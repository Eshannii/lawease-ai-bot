import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyUser = async (req, res, next) => {
  try {
    // check if Authorization header exists
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    req.user = { id: user._id, role: user.role }; // safer to just pass id and role
    next();
  } catch (error) {
    console.error("Verification Middleware Error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        error: "Authentication failed. Please log in again.",
      });
    }

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export default verifyUser;
