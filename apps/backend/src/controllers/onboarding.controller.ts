import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Onboarding from '../models/Onboarding';

export const getOnboardings = async (req: AuthRequest, res: Response) => {
    try {
        const onboardings = await Onboarding.find({ orgId: req.user.organizationId }).populate('candidateId', 'name');
        res.json(onboardings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createOnboarding = async (req: AuthRequest, res: Response) => {
    try {
        const onboarding = await Onboarding.create({
            ...req.body,
            orgId: req.user.organizationId
        });
        res.status(201).json(onboarding);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id, taskIndex } = req.params;
        const { status } = req.body;

        const onboarding = await Onboarding.findById(id);
        if (!onboarding) return res.status(404).json({ message: 'Onboarding not found' });

        if (onboarding.tasks && onboarding.tasks[parseInt(taskIndex)]) {
            onboarding.tasks[parseInt(taskIndex)].status = status;
            await onboarding.save();
        }

        res.json(onboarding);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
