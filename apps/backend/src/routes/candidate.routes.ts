import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { createCandidate, getCandidates, getCandidateById, updateStage, updateCandidate, deleteCandidate } from '../controllers/candidate.controller';

const router = express.Router();

router.route('/')
    .post(protect, createCandidate)
    .get(protect, getCandidates);

router.route('/:id')
    .get(protect, getCandidateById)
    .put(protect, updateCandidate)
    .delete(protect, deleteCandidate);

router.route('/:id/stage')
    .put(protect, authorize('recruiter', 'manager'), updateStage);

import { uploadResume } from '../controllers/candidate.controller';
router.route('/upload').post(protect, uploadResume);

export default router;
