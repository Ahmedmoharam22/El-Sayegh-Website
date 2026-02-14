import News from "../models/News.js";

// GET all news (Public)
export const getAllNews = async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
};

// POST news (Admin)
export const createNews = async (req, res) => {
  const { title, description, image } = req.body;

  const news = await News.create({
    title,
    description,
    image,
  });

  res.status(201).json(news);
};
