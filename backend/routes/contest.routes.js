import express from "express";
import { contestUpload } from "../middleware/uploadMiddleware.js";
import auth from "../middleware/auth.js";
import { approveApplicant, deleteApplicant, getApplicants, registerApplicant } from "../controllers/contestController.js";
import Contest from "../models/Contest.js";

const router = express.Router();

// Public Route
router.post("/register", contestUpload, registerApplicant);

// Admin Routes (محمية بـ Middleware)
router.get("/applicants", auth, getApplicants);
router.put("/approve/:id", auth, approveApplicant);
router.delete("/:id", auth, deleteApplicant);
// رصد درجة المتسابق
router.put('/update-score/:id', async (req, res) => {
  try {
    const { score, grade, isResultPublished } = req.body;
    
    const updatedParticipant = await Contest.findByIdAndUpdate(
      req.params.id,
      { score, grade, isResultPublished },
      { new: true } // يرجع البيانات الجديدة بعد التعديل
    );

    if (!updatedParticipant) {
      return res.status(404).json({ message: "المتسابق غير موجود" });
    }

    res.status(200).json({ message: "تم رصد الدرجة بنجاح", data: updatedParticipant });
  } catch (error) {
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
});
// الاستعلام عن النتيجة بالرقم القومي
router.get('/result/:nationalId', async (req, res) => {
  try {
    const participant = await Contest.findOne({ 
      nationalId: req.params.nationalId,
      isResultPublished: true // مش هيطلع نتيجة لو الآدمن لسه قافلها
    });

    if (!participant) {
      return res.status(404).json({ 
        message: "عذراً، لم يتم العثور على النتيجة. تأكد من الرقم القومي أو انتظر اعتماد النتائج." 
      });
    }

    // بنرجع بس البيانات اللي المتسابق محتاجها (عشان الخصوصية)
    res.status(200).json({
      fullName: participant.fullName,
      level: participant.level,
      score: participant.score,
      grade: participant.grade
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
});


// نشر كل النتائج دفعة واحدة
router.put('/publish-all', async (req, res) => {
  try {
    await Contest.updateMany({}, { isResultPublished: true });
    res.json({ message: "تم نشر جميع النتائج بنجاح، الآن يمكن للجمهور الاستعلام" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
});
// جلب الإعدادات (عشان نعرف النتيجة ظهرت ولا لا)
router.get('/settings', async (req, res) => {
  const settings = await Contest.findOne(); // هترجع object فيه { showResults: true/false }
  res.json(settings);
});

// تحديث الإعدادات (للأدمن فقط)
router.put('/settings', async (req, res) => {
  const { showResults } = req.body;
  await Contest.findOneAndUpdate({}, { showResults }, { upsert: true });
  res.json({ message: "تم تحديث حالة ظهور النتائج" });
});
export default router;