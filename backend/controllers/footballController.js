import Football from "../models/Football.js";

// 1. تسجيل فريق جديد (للشباب في القرية)
export const registerTeam = async (req, res) => {
  try {
    const newTeam = new Football(req.body);
    await newTeam.save();
    res.status(201).json({ message: "تم تسجيل فريقك بنجاح، بالتوفيق!" });
  } catch (error) {
    res.status(400).json({ message: "خطأ في البيانات، تأكد من ملء كل الحقول" });
  }
};

// 2. جلب كل الفرق (للداشبورد)
export const getTeams = async (req, res) => {
  try {
    const teams = await Football.find().sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
};

// 3. تحديث حالة الدفع أو القبول ( في الداشبورد)
export const updateTeamStatus = async (req, res) => {
  try {
    const updated = await Football.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "فشل التحديث" });
  }
};

// 4. حذف فريق
export const deleteTeam = async (req, res) => {
  try {
    await Football.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "تم حذف الفريق" });
  } catch (error) {
    res.status(400).json({ message: "فشل الحذف" });
  }
};
