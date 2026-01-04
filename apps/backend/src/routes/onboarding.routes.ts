import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getOnboardings, createOnboarding, updateTaskStatus } from '../controllers/onboarding.controller';

const router = express.Router();

router.route('/')
    .get(protect, getOnboardings)
    .post(protect, createOnboarding);

router.route('/:id/tasks/:taskIndex')
    .put(protect, updateTaskStatus);

export default router;
