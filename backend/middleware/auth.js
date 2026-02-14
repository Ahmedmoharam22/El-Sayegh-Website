import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "لا يوجد تصريح، الوصول مرفوض" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "التوكن غير صالح" });
  }
};

export default authMiddleware;