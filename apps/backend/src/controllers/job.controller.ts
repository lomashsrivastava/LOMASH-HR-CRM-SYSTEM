import { Request, Response } from 'express';
import Job from '../models/Job';
import { AuthRequest } from '../middleware/auth.middleware';

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.create({
            ...req.body,
            orgId: req.user.role === 'admin' ? req.body.orgId : req.user.organizationId, // simplified
            hiringManagers: [req.user.id]
        });
        res.status(201).json(job);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
    try {
        const jobs = await Job.find({ orgId: req.user.organizationId })
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getJobById = async (req: Request, res: Response) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateJob = async (req: Request, res: Response) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteJob = async (req: Request, res: Response) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
