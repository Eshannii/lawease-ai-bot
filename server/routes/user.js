import express from "express";
import { getAllUsers, deleteUser } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET  /api/users        — Sab users (admin only)
router.get("/", authMiddleware, getAllUsers);

// DELETE /api/users/:id  — User delete (admin only)
router.delete("/:id", authMiddleware, deleteUser);

export default router;
