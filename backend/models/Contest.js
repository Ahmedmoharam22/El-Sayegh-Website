import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, "الاسم الرباعي مطلوب"], 
    trim: true,
    minlength: [15, "يرجى كتابة الاسم رباعياً بوضوح"],
  },
  // ...............................................................
  score: {
  type: Number,
  default: 0, // الدرجة الافتراضية صفر لحد ما ترصدوها
},
grade: {
  type: String,
  default: "لم ترصد", // (ممتاز، جيد جداً، جيد، مقبول)
  trim: true
},
isResultPublished: {
  type: Boolean,
  default: false, // النتيجة مش هتظهر للمتسابق غير لما الأدمن يخليها true
},
showResults: {
    type: Boolean,
    default: false
  },
  // ...............................................................
 teacherName: {
    type: String,
    required: false, 
    trim: true,
    default: ""
  },
  teacherPhone: {
    type: String,
    required: false,
    trim: true,
    default: ""
  },
email: { 
    type: String, 
    required: [true, "البريد الإلكتروني مطلوب"],
    lowercase: true,
    trim: true
},  nationalId: {
    type: String,
    required: [true, "الرقم القومي مطلوب (14 رقم)"],
    unique: true,
    match: [/^\d{14}$/, "الرقم القومي يجب أن يتكون من 14 رقم"]
  },
  parentName: { type: String, required: [true, "اسم ولي الأمر مطلوب"] },
  village: {
    type: String,
    required: [true, "يرجى اختيار القرية"],
    enum: ["الصايغ"]
  },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  level: { 
    type: String, 
    required: true,
    enum: ["القرآن كاملاً", "ثلاثة أرباع القرآن", "نصف القرآن", "ربع القرآن", "براعم الأطفال"]
  },
  gender: { type: String, enum: ["ذكر", "أنثى"], required: true },
  
  // --- بند رقم 7: المرفقات المطلوبة ---
  personalImage: { 
    type: String, 
    required: [true, "الصورة الشخصية للمتسابق مطلوبة"] 
  },
  documentImage: { 
    type: String, 
    required: [true, "صورة شهادة الميلاد أو الرقم القومي للمتسابق مطلوبة"] 
  },
  parentIdFrontImage: { 
    type: String, 
    required: [true, "صورة بطاقة ولي الأمر (وجه) مطلوبة"] 
  },
  parentIdBackImage: { 
    type: String, 
    required: [true, "صورة بطاقة ولي الأمر (ظهر) مطلوبة"] 
  },
  // ---------------------------------

  status: { 
    type: String, 
    default: "قيد المراجعة",
    enum: ["قيد المراجعة", "مقبول", "مرفوض"]
  }
}, { timestamps: true });


const Contest = mongoose.models.Contest || mongoose.model("Contest", contestSchema);
export default Contest;