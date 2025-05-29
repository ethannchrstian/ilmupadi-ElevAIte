import express from "express";
import cors from "cors";
import multer from "multer";
import { PrismaClient } from "@prisma/client";


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