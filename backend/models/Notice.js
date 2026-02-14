import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["كهرباء", "مياه", "صحة", "وظائف", "عام"], 
    default: "عام" 
  },
  isUrgent: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notice", noticeSchema);