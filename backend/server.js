import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import newsRoutes from "./routes/news.routes.js";
import authRoutes from "./routes/auth.routes.js";
import personRoutes from "./routes/person.routes.js";
import charityRoutes from "./routes/charity.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import footballRoutes from "./routes/footballRoutes.js";
import compression from "compression";
const app = express();

dotenv.config(); 

connectDB(); 


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(compression()); 

app.use(cors({
    origin: 'http://localhost:5173', // "https://your-domain.com"
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], 
    credentials: true 
}));

app.use("/uploads", express.static("uploads")); 


const PORT = process.env.PORT || 3000;

app.use("/news", newsRoutes);
app.use("/auth", authRoutes); 
app.use("/person", personRoutes);
app.use("/charity", charityRoutes)
app.use("/contest", contestRoutes);
app.use("/gallery", galleryRoutes);
app.use("/contact", contactRoutes);
app.use("/notices", noticeRoutes);
app.use("/football", footballRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});