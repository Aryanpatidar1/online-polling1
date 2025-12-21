import express from "express";
import { getPollResults } from "../controllers/resultsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/:pollId", getPollResults);

export default router;
