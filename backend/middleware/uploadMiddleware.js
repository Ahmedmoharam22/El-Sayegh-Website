import multer from "multer";
import path from "path";
import fs from "fs";

// التأكد من وجود المجلدات حتى لا يحدث خطأ
const uploadDir = "uploads/contestants/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // قبول الصور فقط
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("الملف المرفوع ليس صورة!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});


// تصدير الـ Fields المطلوبة للمسابقة
export const contestUpload = upload.fields([
  { name: 'personalImage', maxCount: 1 },
  { name: 'documentImage', maxCount: 1 },
  { name: 'parentIdFrontImage', maxCount: 1 },
  { name: 'parentIdBackImage', maxCount: 1 },
])

