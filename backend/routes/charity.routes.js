import express from "express";
import CharityStats from "../models/CharityStats.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 1. جلب الإحصائيات (للموقع العام)
// 1. جلب الإحصائيات والإعدادات (للموقع العام)
router.get("/", async (req, res) => {
  try {
    // بنحاول نلاقي أول وثيقة (Settings/Stats)
    let stats = await CharityStats.findOne();

    // لو مفيش بيانات خالص (أول مرة تشغل السيستم)، بنكريت القيم الافتراضية
    if (!stats) {
      stats = await CharityStats.create({
        helpedCases: 0,
        activeVolunteers: 0,
        completedInitiatives: 0,
        sponsoredFamilies: 0,
        quranRegistration: false 
      });
      console.log("✅ تم إنشاء وثيقة الإحصائيات الافتراضية بنجاح");
    }

    res.json(stats);
  } catch (err) {
    console.error("Error Fetching Stats:", err);
    res.status(500).json({ message: "خطأ في جلب إحصائيات وإعدادات الخير" });
  }
});
// 2. تحديث الإحصائيات (محمي للأدمن فقط)
router.put("/update", auth, async (req, res) => {
  try {
    const { 
      helpedCases, 
      activeVolunteers, 
      completedInitiatives, 
      sponsoredFamilies, 
      quranRegistration ,
      footballRegistration
    } = req.body;
  
    const stats = await CharityStats.findOneAndUpdate(
      {}, 
      { 
        helpedCases, 
        activeVolunteers, 
        completedInitiatives, 
        sponsoredFamilies, 
        quranRegistration ,
        footballRegistration
      },
      { new: true, upsert: true }
    );
    
    res.json({ message: "تم تحديث البيانات والإعدادات بنجاح! ✨", stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في تحديث البيانات" });
  }
});

export default router;