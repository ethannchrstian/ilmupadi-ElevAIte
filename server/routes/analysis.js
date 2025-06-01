import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Save analysis result
router.post('/analysis', async (req, res) => {
    const { imageName, imagePath, prediction, confidence, userId } = req.body;

    if (!imageName || !prediction || !userId) {
        console.log(`--- [ANALYSIS ROUTER] Bad Request (POST /api/analysis): Missing fields. Request body:`, req.body);
        return res.status(400).json({ message: 'imageName, prediction, dan userId wajib diisi' });
    }

    try {
        const idToQuery = parseInt(userId);
        if (isNaN(idToQuery)) {
            console.log(`--- [ANALYSIS ROUTER] Bad Request (POST /api/analysis): Invalid userId format "${userId}" ---`);
            return res.status(400).json({ message: 'User ID tidak valid.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: idToQuery }
        });

        if (!user) {
            console.log(`--- [ANALYSIS ROUTER] Not Found (POST /api/analysis): User not found for userId: ${idToQuery} ---`);
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
                    select: { id: true, name: true, email: true }
                }
            }
        });
        res.status(201).json(newAnalysis);
    } catch (error) {
        console.error('--- [ANALYSIS ROUTER] Error (POST /api/analysis): Error saving analysis:', error);
        res.status(500).json({ message: 'Gagal menyimpan hasil analisis' });
    }
});

// Get user's analysis history
router.get('/analysis/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    try {
        const idToQuery = parseInt(userId);
        if (isNaN(idToQuery)) {
            console.log(`--- [ANALYSIS ROUTER] Bad Request (GET /api/analysis/user/${userId}): Invalid userId format ---`);
            return res.status(400).json({ message: 'User ID tidak valid.' });
        }

        const analyses = await prisma.analysis.findMany({
            where: { userId: idToQuery },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const totalCount = await prisma.analysis.count({
            where: { userId: idToQuery }
        });

        res.json({
            analyses,
            totalCount,
            hasMore: totalCount > (parseInt(offset) + analyses.length)
        });
    } catch (error) {
        console.error(`--- [ANALYSIS ROUTER] Error (GET /api/analysis/user/${userId}): Error fetching user analyses:`, error);
        res.status(500).json({ message: 'Gagal mengambil riwayat analisis' });
    }
});

// Get all analysis(admin view)
router.get('/analysis', async (req, res) => {
    const { limit = 20, offset = 0 } = req.query;

    try {
        const analyses = await prisma.analysis.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true }
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
        console.error('--- [ANALYSIS ROUTER] Error (GET /api/analysis - admin): Error fetching analyses:', error);
        res.status(500).json({ message: 'Gagal mengambil data analisis' });
    }
});

// Delete analysis (user can only delete their own)
router.delete('/analysis/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        console.log(`--- [ANALYSIS ROUTER] Bad Request (DELETE /api/analysis/${id}): Missing userId in body for authorization ---`);
        return res.status(400).json({ message: 'User ID diperlukan untuk otorisasi penghapusan.' });
    }

    try {
        const idToDelete = parseInt(id);
        if (isNaN(idToDelete)) {
            console.log(`--- [ANALYSIS ROUTER] Bad Request (DELETE /api/analysis/${id}): Invalid analysis ID format ---`);
            return res.status(400).json({ message: 'Analysis ID tidak valid.' });
        }

        const requestingUserId = parseInt(userId);
        if (isNaN(requestingUserId)) {
            console.log(`--- [ANALYSIS ROUTER] Bad Request (DELETE /api/analysis/${id}): Invalid userId in body for auth ---`);
            return res.status(400).json({ message: 'User ID (otorisasi) tidak valid.' });
        }

        const existingAnalysis = await prisma.analysis.findUnique({
            where: { id: idToDelete }
        });

        if (!existingAnalysis) {
            console.log(`--- [ANALYSIS ROUTER] Not Found (DELETE /api/analysis/${idToDelete}): Analysis not found ---`);
            return res.status(404).json({ message: 'Analisis tidak ditemukan' });
        }

        if (existingAnalysis.userId !== requestingUserId) {
            console.log(`--- [ANALYSIS ROUTER] Forbidden (DELETE /api/analysis/${idToDelete}): User ${requestingUserId} attempted to delete analysis of user ${existingAnalysis.userId} ---`);
            return res.status(403).json({ message: 'Tidak diizinkan menghapus analisis orang lain' });
        }

        await prisma.analysis.delete({
            where: { id: idToDelete }
        });

        res.json({ message: 'Analisis berhasil dihapus' });
    } catch (error) {
        console.error(`--- [ANALYSIS ROUTER] Error (DELETE /api/analysis/${id}): Error deleting analysis:`, error);
        res.status(500).json({ message: 'Gagal menghapus analisis' });
    }
});

export default router;