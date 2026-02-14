import express from "express";
import Notice from "../models/Notice.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// جلب كل الإعلانات 
router.get("/all", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ isUrgent: -1, createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب الأخبار" });
  }
});

// إضافة خبر جديد (للأدمن)
router.post("/add", auth, async (req, res) => {
  try {
    const newNotice = new Notice(req.body);
    await newNotice.save();
    res.status(201).json({ message: "تم نشر الخبر بنجاح" });
  } catch (err) {
    res.status(400).json({ message: "فشل في النشر" });
  }
});


// تعديل خبر
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, content, isUrgent } = req.body;

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, content, isUrgent },
      { new: true } // عشان يرجعلك الخبر بعد ما اتعدل
    );

    if (!updatedNotice) {
      return res.status(404).json({ message: "الخبر غير موجود" });
    }

    res.json({ message: "تم تحديث الخبر بنجاح ✅", notice: updatedNotice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في تحديث الخبر" });
  }
});
// حذف خبر
router.delete("/:id", auth, async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: "تم حذف الخبر" });
});

export default router;