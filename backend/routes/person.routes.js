import express from "express";
import PersonOfYear from "../models/PersonOfYear.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import fs from "fs"; 
import path from "path";
const router = express.Router();

// إعدادات رفع الصور (ممكن تستخدم نفس إعدادات الأخبار)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 1. الحصول على شخصية السنة (للعرض في الموقع)
router.get("/", async (req, res) => {
  try {
    // هنجيب أحدث شخصية تم إضافتها
    const person = await PersonOfYear.findOne().sort({ createdAt: -1 });
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب البيانات" });
  }
});
// 2. الحصول على الأرشيف (للعرض في الموقع)
router.get("/archive", async (req, res) => {
  try {
    const history = await PersonOfYear.find().sort({ year: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب الأرشيف" });
  }
});

// 2. إضافة شخصية جديدة (محمي للأدمن)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, title, description, year, category } = req.body;
    const newPerson = new PersonOfYear({
      name, title, description, year, category,
      image: req.file.filename
    });
    await newPerson.save();
    res.json({ message: "تم إضافة شخصية العام بنجاح ✅" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الحفظ" });
  }
});

// 3. تحديث شخصية العام (محمي للأدمن)
// 3. تحديث شخصية العام
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, title, description, year, category } = req.body;
    
    // 1. جهز الداتا اللي جاية من النص
    let updateData = { name, title, description, year, category };

    // 2. تشيك: هل فيه صورة جديدة ارفعت؟
    if (req.file) {
      updateData.image = req.file.filename;
      
      // (اختياري) ممكن هنا تمسح الصورة القديمة من السيرفر عشان توفر مساحة
      // const oldPerson = await PersonOfYear.findById(req.params.id);
      // if (oldPerson?.image) fs.unlinkSync(`./uploads/${oldPerson.image}`);
    }

    const updatedPerson = await PersonOfYear.findByIdAndUpdate(
      req.params.id,
      updateData, // نمرر الداتا الديناميكية
      { new: true }
    );

    if (!updatedPerson) {
      return res.status(404).json({ message: "شخصية العام غير موجودة" });
    }

    res.json({ message: "تم تحديث شخصية العام بنجاح ✅", data: updatedPerson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في التحديث" });
  }
});

// 4. حذف شخصية العام (محمي للأدمن)
router.delete("/:id", auth, async (req, res) => {
  try {
    // 1. ابحث عن الشخص أولاً قبل الحذف عشان نعرف اسم الصورة
    const person = await PersonOfYear.findById(req.params.id);

    if (!person) {
      return res.status(404).json({ message: "شخصية العام غير موجودة" });
    }

    const imagePath = path.join(process.cwd(), "uploads", person.image);

    await PersonOfYear.findByIdAndDelete(req.params.id);

    // 4. حذف ملف الصورة من السيرفر (لو الملف موجود فعلاً)
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("تم مسح ملف الصورة من السيرفر بنجاح ✅");
    }

    res.json({ message: "تم حذف الشخصية وملف الصورة بنجاح ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
  }
});

export default router;