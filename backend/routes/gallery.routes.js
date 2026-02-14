import express from "express";
import multer from "multer";
import path from "path";
import Gallery from "../models/Gallery.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// إعداد مكان التخزين
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/gallery/"); // تأكد إن الفولدر ده موجود
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // اسم فريد لكل صورة
  },
});

const upload = multer({ storage });

// 1. جلب الصور (عادي زي ما هو)
router.get("/", async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب الصور" });
  }
});

// 2. إضافة صورة (تعديل عشان يستقبل ملف)
router.post("/add", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "يرجى اختيار صورة" });
    }

    // بنخزن المسار اللي الفرونت إند هيقدر يفتحه
    const imageUrl = `http://localhost:5000/uploads/gallery/${req.file.filename}`;

    const newImage = new Gallery({ title, imageUrl, category });
    await newImage.save();

    res.status(201).json({ message: "تم رفع الصورة للمعرض بنجاح ", newImage });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء الرفع" });
  }
});

// 3. حذف صورة
router.delete("/:id", auth, async (req, res) => {
  try {
    // ملحوظة: السينيور الصح بيمسح الملف كمان من الهارد ديسك مش بس من الداتابيز
    // بس خلينا دلوقتي نمسح من الداتا عشان منتعقدش
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف الصورة" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الحذف" });
  }
});

export default router;