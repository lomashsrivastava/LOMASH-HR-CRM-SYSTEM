import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import TalentPool from '../models/TalentPool';

export const getTalentPool = async (req: AuthRequest, res: Response) => {
    try {
        const talents = await TalentPool.find({ orgId: req.user.organizationId }).sort({ createdAt: -1 });
        res.json(talents);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createTalent = async (req: AuthRequest, res: Response) => {
    try {
        const talent = await TalentPool.create({
            ...req.body,
            orgId: req.user.organizationId
        });
        res.status(201).json(talent);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTalent = async (req: Request, res: Response) => {
    try {
        const talent = await TalentPool.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!talent) return res.status(404).json({ message: 'Talent not found' });
        res.json(talent);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTalent = async (req: Request, res: Response) => {
    try {
        const talent = await TalentPool.findByIdAndDelete(req.params.id);
        if (!talent) return res.status(404).json({ message: 'Talent not found' });
        res.json({ message: 'Talent removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkCreateTalent = async (req: AuthRequest, res: Response) => {
    try {
        const talents = req.body;
        if (!Array.isArray(talents)) return res.status(400).json({ message: 'Input must be an array' });

        const talentsWithOrg = talents.map(t => ({ ...t, orgId: req.user.organizationId }));
        const created = await TalentPool.insertMany(talentsWithOrg);
        res.status(201).json(created);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
