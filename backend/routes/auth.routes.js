import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "اسم المستخدم أو كلمة المرور خطأ" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "اسم المستخدم أو كلمة المرور خطأ" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
// إنشاء أدمن جديد (محمي)
router.post("/register", auth, async (req, res) => {
  try {
    const { username, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: "admin"
    });

    await newUser.save();

    return res.status(201).json({ message: "تم إنشاء حساب المدير بنجاح ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في السيرفر أثناء الإنشاء" });
  }
});

export default router;