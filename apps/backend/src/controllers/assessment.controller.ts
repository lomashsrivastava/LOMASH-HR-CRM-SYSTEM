import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Assessment from '../models/Assessment';

export const getAssessments = async (req: AuthRequest, res: Response) => {
    try {
        const assessments = await Assessment.find({ orgId: req.user.organizationId });
        res.json(assessments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAssessment = async (req: AuthRequest, res: Response) => {
    try {
        const assessment = await Assessment.create({
            ...req.body,
            orgId: req.user.organizationId
        });
        res.status(201).json(assessment);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateAssessment = async (req: Request, res: Response) => {
    try {
        const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        res.json(assessment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAssessment = async (req: Request, res: Response) => {
    try {
        const assessment = await Assessment.findByIdAndDelete(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        res.json({ message: 'Assessment removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
