import express from "express";
import {
  searchCaseLaws,
  getCaseById,
} from "../controllers/caseLawController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/search?keyword=...
router.get("/", authMiddleware, searchCaseLaws);

// GET /api/search/case/:id  -> pura judgment fetch karne ke liye
router.get("/case/:id", authMiddleware, getCaseById);

export default router;
