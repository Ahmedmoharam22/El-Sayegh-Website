import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // mail.webamz.com
      port: process.env.EMAIL_PORT, // 465
      secure: true, // true لأننا بنستخدم بورت 465 (SSL)
      auth: {
        user: process.env.EMAIL_USER, // el-sayigh@webamz.com
        pass: process.env.EMAIL_PASS, // الباسورد المعقد ده
      },
      // إضافة دي عشان نضمن إن السيرفرات الخاصة متعملش بلوك للطلب
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      // ركز هنا: لازم الـ from يكون هو نفس الإيميل الرسمي بتاع القرية
      from: `"رابطة شباب الصايغ" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || "",
      html: html || "",
      attachments: attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

export default sendEmail;