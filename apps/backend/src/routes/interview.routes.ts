import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { createInterview, getInterviews } from '../controllers/interview.controller';

const router = express.Router();

router.route('/')
    .post(protect, createInterview)
    .get(protect, getInterviews);

export default router;
