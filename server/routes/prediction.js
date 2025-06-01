import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });


const predictionKey = process.env.AZURE_PREDICTION_KEY;
const endpoint = process.env.AZURE_ENDPOINT;
const projectId = process.env.AZURE_PROJECT_ID;
const publishedName = process.env.AZURE_PUBLISHED_NAME;


router.get('/test', (req, res) => {
    res.send('Prediction router is working!');
});


router.post('/predict', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imagePath = req.file.path;
        const imageData = fs.readFileSync(imagePath);

        const url = `${endpoint}/customvision/v3.0/Prediction/${projectId}/classify/iterations/${publishedName}/image`;

        const response = await axios.post(url, imageData, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Prediction-Key': predictionKey,
            },
        });

        fs.unlinkSync(imagePath);

        res.json(response.data);
    } catch (error) {
        console.error('Prediction error:', error);

        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }

        res.status(500).json({
            error: 'Prediction failed',
            details: error.response?.data || error.message
        });
    }
});

export default router;
