import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from 'dotenv';

import predictRouter from './routes/prediction.js';
import authRouter from './routes/auth.js';
import newsRouter from './routes/news.js';
import forumRouter from './routes/forum.js';
import analysisRouter from './routes/analysis.js';

dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Routes
app.use('/api', predictRouter);
app.use('/api', authRouter);
app.use('/api', newsRouter);
app.use('/api', forumRouter);
app.use('/api', analysisRouter);

// Check server
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});


