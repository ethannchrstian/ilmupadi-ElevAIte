import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Save analysis result
router.post('/analysis', async (req, res) => {
    console.log(`--- [SERVER LOG] HIT: POST /api/analysis ---`);
    const { imageName, imagePath, prediction, confidence, userId } = req.body;

    if (!imageName || !prediction || !userId) {
        console.log(`--- [SERVER LOG] POST /api/analysis - Missing fields ---`);
        return res.status(400).json({ message: 'imageName, prediction, dan userId wajib diisi' });
    }

    try {
        const idToQuery = parseInt(userId);
        if (isNaN(idToQuery)) {
            console.error(`--- [SERVER LOG] POST /api/analysis - Invalid userId: ${userId} ---`);
            return res.status(400).json({ message: 'User ID tidak valid.' });
        }
        console.log(`--- [SERVER LOG] POST /api/analysis - Processing for userId: ${idToQuery} ---`);
        const user = await prisma.user.findUnique({
            where: { id: idToQuery }
        });

        if (!user) {
            console.log(`--- [SERVER LOG] POST /api/analysis - User not found for userId: ${idToQuery} ---`);
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const newAnalysis = await prisma.analysis.create({
            data: {
                imageName,
                imagePath: imagePath || '',
                prediction,
                confidence: confidence ? parseFloat(confidence) : null,
                userId: idToQuery
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        console.log(`--- [SERVER LOG] POST /api/analysis - Analysis saved successfully for userId: ${idToQuery} ---`);
        res.status(201).json(newAnalysis);
    } catch (error) {
        console.error('--- [SERVER LOG] POST /api/analysis - Error saving analysis:', error);
        res.status(500).json({ message: 'Gagal menyimpan hasil analisis' });
    }
});

// Get user's analysis history
router.get('/analysis/user/:userId', async (req, res) => {
    console.log(`--- [SERVER LOG] HIT: GET /api/analysis/user/${req.params.userId} ---`);
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    try {
        const idToQuery = parseInt(userId);
        if (isNaN(idToQuery)) {
            console.error(`--- [SERVER LOG] GET /api/analysis/user/:userId - Invalid userId: ${userId} ---`);
            return res.status(400).json({ message: 'User ID tidak valid.' });
        }
        console.log(`--- [SERVER LOG] GET /api/analysis/user/:userId - Querying analyses for userId: ${idToQuery} ---`);

        const analyses = await prisma.analysis.findMany({
            where: { userId: idToQuery },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const totalCount = await prisma.analysis.count({
            where: { userId: idToQuery }
        });
        console.log(`--- [SERVER LOG] GET /api/analysis/user/:userId - Found ${analyses.length} analyses for userId: ${idToQuery} ---`);
        res.json({
            analyses,
            totalCount,
            hasMore: totalCount > parseInt(offset) + analyses.length
        });
    } catch (error) {
        console.error(`--- [SERVER LOG] GET /api/analysis/user/:userId - Error fetching user analyses for userId ${userId}:`, error);
        res.status(500).json({ message: 'Gagal mengambil riwayat analisis' });
    }
});


// Get all analysis (admin view)
router.get('/analysis', async (req, res) => {
    console.log(`--- [SERVER LOG] HIT: GET /api/analysis (admin view) ---`);
    const { limit = 20, offset = 0 } = req.query;

    try {
        const analyses = await prisma.analysis.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const totalCount = await prisma.analysis.count();

        res.json({
            analyses,
            totalCount,
            hasMore: totalCount > (parseInt(offset) + analyses.length)
        });
    } catch (error) {
        console.error('--- [SERVER LOG] GET /api/analysis (admin view) - Error fetching analyses:', error);
        res.status(500).json({ message: 'Gagal mengambil data analisis' });
    }
});

// Delete analysis 
router.delete('/analysis/:id', async (req, res) => {
    console.log(`--- [SERVER LOG] HIT: DELETE /api/analysis/${req.params.id} ---`);
    const { id } = req.params;
    const { userId } = req.body;

    try {

        res.json({ message: 'Analisis berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting analysis:', error);
        res.status(500).json({ message: 'Gagal menghapus analisis' });
    }
});

export default router;