import express from "express";
import cors from "cors";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'


const prisma = new PrismaClient();

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/predict", upload.single("image"), (req, res) => {

  console.log("Received file:", req.file);

  // send response (gantiin dengan model prediction)
  res.json({ prediction: "Healthy" });
});


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

// server working or not test
app.listen(5000, () => console.log("app is running on port 5000"));

// auth regis

app.use(express.json()); // tambahin ini buat bisa baca req.body

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) return res.status(400).json({ message: "Isi semua field" });

    try{
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
  } catch(err){
    console.error(err);
    res.status(500).json({message: "Register Error"});
  }
});

// auth login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  try{
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Email tidak ditemukan" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Password salah" });

    res.json({ id: user.id, name: user.name, email: user.email });
  }catch(err){
    console.error(err);
    res.status(500).json({message: "Login Error"});
  }
});