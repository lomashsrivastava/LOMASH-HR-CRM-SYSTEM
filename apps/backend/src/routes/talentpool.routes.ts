import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getTalentPool, createTalent, updateTalent, deleteTalent, bulkCreateTalent } from '../controllers/talentpool.controller';

const router = express.Router();

router.route('/')
    .get(protect, getTalentPool)
    .post(protect, createTalent);

router.post('/bulk', protect, bulkCreateTalent);

router.route('/:id')
    .put(protect, updateTalent)
    .delete(protect, deleteTalent);

export default router;
