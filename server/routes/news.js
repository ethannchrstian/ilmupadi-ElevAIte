import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// News API configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Get news articles
router.get("/news", async (req, res) => {
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

        // Build params 
        const params = {
            q: q,
            language: language,
            apiKey: NEWS_API_KEY
        };

        // Only add params if explicitly given
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

// Get news sources
router.get("/sources", async (req, res) => {
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

export default router;