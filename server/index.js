import express from "express";
import cors from "cors";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON requests

const upload = multer({ dest: "uploads/" });

// News API configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// ===== EXISTING ROUTES =====

// Image prediction route
app.post("/predict", upload.single("image"), (req, res) => {
  console.log("Received file:", req.file);
  // send response (gantiin dengan model prediction)
  res.json({ prediction: "Healthy" });
});

// Database test route
app.get("/test-db", async (req, res) => {
  try {
    // Create a test record
    const newAnalysis = await prisma.analysis.create({
      data: {
        imageName: "test.jpg",
        imagePath: "/uploads/test.jpg",
        prediction: "Test prediction",
      },
    });

    // Fetch all records
    const allAnalysis = await prisma.analysis.findMany();

    res.json({ newAnalysis, allAnalysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// User registration route
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) return res.status(400).json({ message: "Isi semua field" });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Register Error" });
  }
});

// User login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Email tidak ditemukan" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Password salah" });

    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login Error" });
  }
});

// ===== NEWS API ROUTES =====

// Get news articles
// Get news articles - FIXED VERSION
app.get("/api/news", async (req, res) => {
  try {
    const {
      q = 'pertanian',
      language = 'id',
      page,
      sortBy,
      domains,
      sources,
      from,
      to,
      pageSize
    } = req.query;

    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: "News API key not configured" });
    }

    // Build params - only include what's provided or required
    const params = {
      q: q,
      language: language,
      apiKey: NEWS_API_KEY
    };

    // Only add optional parameters if they're explicitly provided
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    if (sortBy) params.sortBy = sortBy;
    if (domains) params.domains = domains;
    if (sources) params.sources = sources;
    if (from) params.from = from;
    if (to) params.to = to;

    console.log('Making API call with params:', params);

    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error);
    console.error('Error response:', error.response?.data);

    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid News API key' });
    } else if (error.response?.status === 429) {
      res.status(429).json({ error: 'News API rate limit exceeded' });
    } else if (error.response?.status === 400) {
      res.status(400).json({
        error: 'Bad request - check your query parameters',
        details: error.response?.data?.message || 'Invalid request parameters'
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  }
});

// Get news sources (keeping this as is since sources endpoint is still useful)
app.get("/api/sources", async (req, res) => {
  try {
    const { category, country, language = 'id' } = req.query;

    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: "News API key not configured" });
    }

    const response = await axios.get(`${NEWS_API_BASE_URL}/sources`, {
      params: {
        apiKey: NEWS_API_KEY,
        category,
        country,
        language
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching sources:', error);

    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid News API key' });
    } else if (error.response?.status === 429) {
      res.status(429).json({ error: 'News API rate limit exceeded' });
    } else {
      res.status(500).json({ error: 'Failed to fetch sources' });
    }
  }
});


// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    newsApiConfigured: !!NEWS_API_KEY
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` News API: ${NEWS_API_KEY ? 'Configured' : 'Not configured - set NEWS_API_KEY in .env'}`);
});