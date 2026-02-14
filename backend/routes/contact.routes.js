import express from "express";
import Contact from "../models/Contact.js";
import sendEmail from "../utils/sendEmail.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 1. استقبال رسالة جديدة (عام)
router.post("/send", async (req, res) => {
  try { 
    const { name, email, subject, message } = req.body;
    
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    // إرسال إشعار للأدمن (اختياري بس مهم)
    await sendEmail({
      to: process.env.EMAIL_USER, // إيميل الجمعية اللي هيستقبل التنبيه
      subject: `رسالة جديدة من: ${name}`,
      html: `<h3>موضوع الرسالة: ${subject}</h3><p>${message}</p><hr/><p>إيميل الراسل: ${email}</p>`
    });

    res.status(201).json({ message: "تم إرسال رسالتك بنجاح، شكراً لتواصلك معنا." });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء إرسال الرسالة" });
  }
});

// 2. جلب كل الرسائل (للأدمن فقط)
router.get("/all", auth, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ في جلب الرسائل" });
  }
});

// 3. حذف رسالة
router.delete("/:id", auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف الرسالة" });
  } catch (err) {
    res.status(500).json({ message: "فشل الحذف" });
  }
});

export default router;