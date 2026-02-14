import Contest from "../models/Contest.js";
import sendEmail from "../utils/sendEmail.js";
import path from "path";
import fs from "fs";

const extractInfoFromNationalId = (id) => {
    if (!id || id.length !== 14) return null;
    const century = id[0] === '2' ? '19' : '20';
    const year = century + id.substring(1, 3);
    const month = id.substring(3, 5);
    const day = id.substring(5, 7);
    const birthDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    const gender = parseInt(id[12]) % 2 !== 0 ? "ذكر" : "أنثى";
    return { age, gender };
};

// 1. تسجيل مشترك جديد
export const registerApplicant = async (req, res) => {
  try {
    // الحقول النصية فقط هي اللي في الـ body
    const { 
      fullName, nationalId, phone, level, village, 
      parentName, email, teacherName, teacherPhone 
    } = req.body;

    // الصور بنسحبها من req.files مش req.body
    const personalImage = req.files?.personalImage?.[0]?.filename;
    const documentImage = req.files?.documentImage?.[0]?.filename;
    // const parentIdImage = req.files?.parentIdImage?.[0]?.filename;
    const parentIdFrontImage = req.files?.parentIdFrontImage?.[0]?.filename;
    const parentIdBackImage = req.files?.parentIdBackImage?.[0]?.filename;

    // التأكد من وجود الـ 3 صور (دلوقتي هيشوفهم صح)
    if (!personalImage || !documentImage || !parentIdFrontImage || !parentIdBackImage) {
      return res.status(400).json({ 
        message: "يرجى رفع كافة الأوراق المطلوبة (الصورة الشخصية، مستند المتسابق، بطاقة ولي الأمر)" 
      });
    }

    const extracted = extractInfoFromNationalId(nationalId);
    if (!extracted) return res.status(400).json({ message: "الرقم القومي غير صحيح" });
    if (extracted.age > 25) return res.status(400).json({ message: "عذراً، أقصى سن للمسابقة هو 25 عاماً" });

    const isExist = await Contest.findOne({ nationalId });
    if (isExist) return res.status(400).json({ message: "هذا الرقم القومي مسجل بالفعل" });

    const newApplicant = new Contest({
      fullName,
      nationalId,
      parentName,
      village,
      teacherName,
      teacherPhone,
      email,
      phone,
      level,
      age: extracted.age,
      gender: extracted.gender,
      personalImage, 
      documentImage,
      parentIdFrontImage,
      parentIdBackImage,
    });

    await newApplicant.save();

    // إرسال إيميل تأكيد استلام الطلب
    try {
        await sendEmail({
          to: email,
          subject: "تأكيد التسجيل - مسابقة قرية الصايغ",
          html: `<h3>أهلاً ${fullName}</h3><p>تم استلام طلبك بنجاح لمستوى ${level}. سيتم مراجعة البيانات والأوراق والرد عليك قريباً.</p>`
        });
    } catch (emailErr) {
        console.log("Email Error: ", emailErr);
        // مش هنوقف التسجيل عشان الإيميل، المهم الداتا اتسيفت
    }

    res.status(201).json({ message: "تم التسجيل بنجاح، بالتوفيق يا بطل!" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
};

// 2. جلب المتقدمين (للأدمن)
export const getApplicants = async (req, res) => {
    try {
        const applicants = await Contest.find().sort({ createdAt: -1 });
        res.json(applicants);
    } catch (error) {
        res.status(500).json({ message: "فشل في جلب البيانات" });
    }
};

// 3. قبول المتسابق وإرسال إيميل موعد الاختبار (تصميم سينيور)
export const approveApplicant = async (req, res) => {
    try {
        const student = await Contest.findByIdAndUpdate(req.params.id, { status: "مقبول" }, { new: true });
        
        const imagePath = path.resolve("uploads", "contest-banner.jpg");
        let base64Image = "";
        if (fs.existsSync(imagePath)) {
            base64Image = fs.readFileSync(imagePath).toString('base64');
        }

        const htmlContent = `
            <div dir="rtl" style="text-align: center; font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 15px; overflow: hidden;">
                <div style="background-color: #FFD700; padding: 20px;">
                    <h1 style="color: #000; margin: 0;">تهانينا يا ${student.fullName.split(' ')[0]}! 🎉</h1>
                </div>
                <div style="padding: 30px; background-color: #fff;">
                    <p style="font-size: 18px; color: #4a5568;">بشرى سارة! لقد تمت مراجعة أوراقك وقبولك رسمياً في مسابقة قرية الصايغ.</p>
                    <div style="background-color: #f7fafc; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><b>المستوى:</b> ${student.level}</p>
                        <p style="margin: 5px 0;"><b>القرية:</b> ${student.village}</p>
                    </div>
                    <p style="color: #2d3748;">موعد الاختبار سيتم تحديده وإرساله لك في رسالة لاحقة، كن مستعداً!</p>
                    ${base64Image ? `<img src="data:image/jpeg;base64,${base64Image}" style="width: 100%; border-radius: 10px; margin-top: 20px;" />` : ""}
                </div>
                <div style="background-color: #edf2f7; padding: 15px; font-size: 12px; color: #718096;">
                    مع تحيات إدارة موقع قرية الصايغ الرسمي
                </div>
            </div>
        `;

        await sendEmail({
            to: student.email,
            subject: " الرمضانيه تم قبولك في مسابقة قرءان قرية الصايغ ✨",
            html: htmlContent
        });

        res.json({ message: "تم قبول المتسابق وإرسال إيميل بنجاح" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "حدث خطأ أثناء عملية القبول" });
    }
};

// 4. حذف متقدم
export const deleteApplicant = async (req, res) => {
    try {
        const applicant = await Contest.findById(req.params.id);
        
        if (!applicant) {
            return res.status(404).json({ message: "المتسابق غير موجود" });
        }

        // المصفوفة اللي فيها أسماء الحقول اللي شايلة أسامي الصور
        const images = [applicant.personalImage, applicant.documentImage, applicant.parentIdImage];

        images.forEach(imgName => {
            if (imgName) {
                // بناء المسار الكامل للصورة
                // تأكد إن المسار مطابق لمجلد الرفع عندك (uploads/contestants)
                const filePath = path.join(process.cwd(), "uploads/contestants", imgName);
                
                // التأكد إن الملف موجود فعلياً قبل محاولة حذفه
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`تم حذف الصورة: ${imgName}`);
                    } catch (err) {
                        console.error(`فشل حذف الملف: ${imgName}`, err);
                        // مش هنوقف العملية لو الصورة متمسحتش، هنكمل حذف من الداتابيز
                    }
                }
            }
        });

        // حذف المتسابق من الداتابيز بعد محاولة حذف صوره
        await Contest.findByIdAndDelete(req.params.id);

        res.json({ message: "تم حذف المتسابق وملفاته بنجاح" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "حدث خطأ أثناء عملية الحذف" });
    }
};