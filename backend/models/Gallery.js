import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "يجب إدخال عنوان للصورة"] 
  },
  imageUrl: { 
    type: String, 
    required: [true, "رابط الصورة مطلوب"] 
  },
  category: { 
    type: String, 
    required: true,
    enum: ["معالم", "قديم", "أنشطة", "مناسبات"],
    default: "معالم"
  }
}, { timestamps: true });

export default mongoose.model("Gallery", gallerySchema);