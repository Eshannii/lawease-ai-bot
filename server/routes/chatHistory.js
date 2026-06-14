import express from "express";
import {
  loadHistory,
  saveHistory,
  deleteHistory,
} from "../controllers/chatHistoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/load", authMiddleware, loadHistory);
router.post("/save", authMiddleware, saveHistory);
router.delete("/delete", authMiddleware, deleteHistory);

export { router as chatHistoryRoutes };
