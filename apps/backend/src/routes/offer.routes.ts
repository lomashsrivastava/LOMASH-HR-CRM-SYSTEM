import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getOffers, createOffer, updateOffer, deleteOffer, sendOfferEmail } from '../controllers/offer.controller';

const router = express.Router();

router.route('/')
    .get(protect, getOffers)
    .post(protect, createOffer);

router.route('/:id')
    .put(protect, updateOffer)
    .delete(protect, deleteOffer);

router.route('/:id/send')
    .post(protect, sendOfferEmail);

export default router;
