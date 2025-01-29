import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { deleteFeedback, getFeedback, listFeedback, updateFeedbackStatus } from './api/Feedback';
import { getStatistic } from './api/Stats';
import { config } from './Essentials';
import { success } from './Log';
import { Server } from 'http';

// * Setup

const app = express();
app.use(express.json());
app.use(cors());

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per windowMs
});

// Apply rate limiter to all requests
app.use(limiter);

// * Routes

// Feedback
app.get('/feedback', listFeedback);
app.get('/feedback/:id', getFeedback);
app.delete('/feedback/:id', deleteFeedback);
app.post('/feedback/:id/status', updateFeedbackStatus);

// Stats
app.get('/stats', getStatistic);

// * Start

export function setupRestApi(): Server {
    return app.listen(config.api_port, () => {
        success(`API listening on port ${config.api_port}`);
    });
}
