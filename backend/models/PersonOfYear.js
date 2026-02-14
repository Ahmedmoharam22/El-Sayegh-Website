import mongoose from "mongoose";

const personOfYearSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true }, // مثال: بطل الجمهورية في الكاراتيه
  description: { type: String, required: true }, // قصة النجاح
  year: { type: Number, required: true, default: new Date().getFullYear() },
  image: { type: String, required: true }, // صورة الشخصية
  category: { type: String, default: "عام" }, // رياضة، تعليم، تطوع
}, { timestamps: true });

export default mongoose.model("PersonOfYear", personOfYearSchema);