import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const MONGO_URI = "mongodb+srv://AhmedMoharam:Fz4lqj7sI7q26l4p@cluster0.aufzeeq.mongodb.net/"; 

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("📡 متصل بقاعدة البيانات...");

    // الخطوة السحرية: مسح الـ Indexes القديمة اللي مسببة مشاكل (زي الإيميل)
    try {
        await User.collection.dropIndexes();
        console.log("🧹 تم تنظيف الـ Indexes القديمة...");
    } catch (e) {
        console.log("ℹ️ لا توجد Indexes للمسح أو تم مسحها بالفعل.");
    }

    const admins = [
      { username: "admin", password: "2292002AhmedMo@@" },
      { username: "MoGad", password: "pass12345MoGad@@" },
      { username: "Ahmedtango", password: "pass12345MoGad@@" }
    ];

    for (const adminData of admins) {
      const userExists = await User.findOne({ username: adminData.username });
      
      if (!userExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        const newUser = new User({
          username: adminData.username,
          password: hashedPassword,
        });

        await newUser.save();
        console.log(`✅ تم إنشاء الحساب: ${adminData.username}`);
      } else {
        console.log(`⚠️ الحساب موجود بالفعل: ${adminData.username}`);
      }
    }

    console.log("✨ انتهت العملية بنجاح!");
    process.exit();
  } catch (error) {
    console.error("❌ خطأ:", error);
    process.exit(1);
  }
};

createAdmin();