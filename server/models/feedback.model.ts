import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  fullName: string;
  score: number;
  feedback: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  feedback: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IFeedback>("Feedback", feedbackSchema);
