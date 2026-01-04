import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Offer from '../models/Offer';

export const getOffers = async (req: AuthRequest, res: Response) => {
    try {
        const offers = await Offer.find({ orgId: req.user.organizationId }).populate('candidateId', 'name');
        res.json(offers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createOffer = async (req: AuthRequest, res: Response) => {
    try {
        const offer = await Offer.create({
            ...req.body,
            orgId: req.user.organizationId
        });
        res.status(201).json(offer);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateOffer = async (req: AuthRequest, res: Response) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(offer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const sendOfferEmail = async (req: AuthRequest, res: Response) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        offer.status = 'Sent';
        offer.sentDate = new Date();
        await offer.save();

        // Mock Email Sending Logic
        console.log(`Sending Offer Email to Candidate ID: ${offer.candidateId}`);

        res.json({ message: 'Offer sent successfully', offer });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteOffer = async (req: AuthRequest, res: Response) => {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });
        res.json({ message: 'Offer deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
