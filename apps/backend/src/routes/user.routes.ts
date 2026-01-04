import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { getUsers, addUser, getOrganization, updateOrganization } from '../controllers/user.controller';

const router = express.Router();

router.route('/organization')
    .get(protect, getOrganization)
    .put(protect, updateOrganization);

router.route('/')
    .get(protect, getUsers)
    .post(protect, addUser);

export default router;
