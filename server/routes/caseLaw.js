import express from "express";
import { searchCaseLaws } from "../controllers/caseLawController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/search?keyword=...
router.get("/", authMiddleware, searchCaseLaws);

export default router;
