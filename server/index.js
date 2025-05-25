import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/predict", upload.single("image"), (req, res) => {

  console.log("Received file:", req.file);

  // send response (gantiin dengan model prediction)
  res.json({ prediction: "Healthy" }); 
});

app.listen(5000, () => console.log("app is running on port 5000"));