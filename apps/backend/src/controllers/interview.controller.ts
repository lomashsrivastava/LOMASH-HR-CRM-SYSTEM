import { Request, Response } from 'express';
import Interview from '../models/Interview';
import { AuthRequest } from '../middleware/auth.middleware';

export const createInterview = async (req: AuthRequest, res: Response) => {
    try {
        const interview = await Interview.create({
            ...req.body,
            scheduledBy: req.user.id
        });
        // Trigger notification (Socket.IO / Email) - TODO
        res.status(201).json(interview);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getInterviews = async (req: AuthRequest, res: Response) => {
    try {
        const interviews = await Interview.find({
            $or: [{ interviewers: req.user.id }, { scheduledBy: req.user.id }]
        })
            .populate('candidateId', 'name')
            .populate('jobId', 'title')
            .sort({ startTime: 1 });

        res.json(interviews);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
