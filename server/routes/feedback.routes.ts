import { Router } from "express";
import { submitFeedback } from "../controllers/feedback.controller";
import {requireAuth } from "../Middleware/auth";

const router = Router();

router.post("/", requireAuth, submitFeedback);

export default router;
