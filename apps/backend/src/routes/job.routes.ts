import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { createJob, getJobs, getJobById, updateJob, deleteJob } from '../controllers/job.controller';

const router = express.Router();

router.route('/')
    .post(protect, authorize('admin', 'recruiter', 'manager'), createJob)
    .get(protect, getJobs);

router.route('/:id')
    .get(protect, getJobById)
    .put(protect, updateJob)
    .delete(protect, deleteJob);

export default router;
