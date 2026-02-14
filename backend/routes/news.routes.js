import express from "express";
import News from "../models/News.js";
import multer from "multer";
import auth from "../middleware/auth.js";

// --- إعدادات تخزين الصور ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname; // استخدام اسم الملف الأصلي أضمن
    cb(null, filename)
  }
})

const upload = multer({ storage: storage })
const router = express.Router();

// --- 1. إنشاء خبر جديد (رفع متعدد) ---
router.post("/", auth, upload.array('image', 6), async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "العنوان والوصف مطلوبان" });
    }

    // استخراج أسماء الملفات المرفوعة من المصفوفة
    const imagesPaths = req.files ? req.files.map(file => file.filename) : [];

    const news = await News.create({
      title,
      description,
      category,
      image: imagesPaths.length > 0 ? imagesPaths[0] : null, // أول صورة هي الغلاف
      allImages: imagesPaths // تخزين كل الصور في المصفوفة
    });

    return res.status(201).json({ message: "تم نشر الخبر وصور الأبطال بنجاح", news });
  } catch (error) {
    console.error("Post News Error:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء حفظ الخبر", error: error.message });
  }
});

// --- 2. جلب جميع الأخبار ---
router.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }); // الترتيب من الأحدث للأقدم
    return res.status(200).json({ message: "News fetched", news });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});

// --- 3. جلب خبر محدد بالـ ID ---
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "الخبر غير موجود" });
    }
    res.status(200).json({ message: "News fetched", news });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});

// --- 4. تحديث خبر (دعم تحديث الصور) ---
router.put("/:id", auth, upload.array('image', 6), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    // تحديث البيانات النصية أولاً
    const updatedData = { title, description, category };

    // لو فيه صور جديدة اترفعت، نحدثها
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      updatedData.image = newImages[0];
      updatedData.allImages = newImages;
    }

    const updatedNews = await News.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!updatedNews) {
      return res.status(404).json({ message: "الخبر غير موجود" });
    }

    res.status(200).json({ message: "تم تحديث الخبر بنجاح", updatedNews });
  } catch (error) {
    return res.status(500).json({ message: "حدث خطأ أثناء التحديث", error: error.message });
  }
});

// --- 5. حذف خبر ---
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNews = await News.findByIdAndDelete(id);
    if (!deletedNews) {
      return res.status(404).json({ message: "الخبر غير موجود" });
    }
    return res.status(200).json({ message: "تم حذف الخبر بنجاح" });
  } catch (error) {
    return res.status(500).json({ message: "حدث خطأ أثناء الحذف", error });
  }
});

export default router;