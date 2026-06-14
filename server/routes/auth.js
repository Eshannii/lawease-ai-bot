import express from "express";
import {
  login,
  register,
  verify,
  changePassword,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/verify", authMiddleware, verify);
router.put("/change-password", authMiddleware, changePassword);

export default router;
