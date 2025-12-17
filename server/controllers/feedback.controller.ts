import { Response } from "express";
import Feedback from "../models/feedback.model";
import { AuthenticatedRequest  } from "../Middleware/auth";

export const submitFeedback = async (
  req: AuthenticatedRequest ,
  res: Response
) => {
  try {
    const { score, feedback } = req.body;

    if (score === undefined || feedback === undefined) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (score < 0 || score > 10) {
      return res.status(400).json({ message: "Invalid score" });
    }

    if (!feedback.trim()) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const savedFeedback = await Feedback.create({
      userId: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      score,
      feedback,
    });

    return res.status(201).json({
      message: "Feedback saved successfully",
      id: savedFeedback._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
