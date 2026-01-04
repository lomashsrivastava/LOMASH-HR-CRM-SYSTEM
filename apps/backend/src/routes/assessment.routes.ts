import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getAssessments, createAssessment, updateAssessment, deleteAssessment } from '../controllers/assessment.controller';

const router = express.Router();

router.route('/')
    .get(protect, getAssessments)
    .post(protect, createAssessment);

router.route('/:id')
    .put(protect, updateAssessment)
    .delete(protect, deleteAssessment);

export default router;
