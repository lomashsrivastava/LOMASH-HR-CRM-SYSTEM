import { Request, Response } from 'express';
import Candidate from '../models/Candidate';
import { AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Multer Config (Storage in 'uploads' folder for now, GridFS later)
const upload = multer({ dest: 'uploads/' });

export const uploadResume = [
    upload.single('resume'),
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

            // Call ML Service to parse
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path));

            const mlUrl = process.env.ML_SERVICE_URL || 'http://ml-service:8000';
            // Django requires trailing slash for POST
            const parseUrl = `${mlUrl}/parse/`;

            let parsedData: any = {};
            try {
                const { data } = await axios.post(parseUrl, formData, {
                    headers: { ...formData.getHeaders() }
                });
                parsedData = data;
            } catch (mlError) {
                console.error('ML Service Error:', mlError);
                // Continue without parsing if ML fails
            }

            // Cleanup
            fs.unlinkSync(req.file.path);

            // Create Candidate Entry
            const candidate = await Candidate.create({
                orgId: req.user.organizationId,
                name: (parsedData as any).name || 'Unknown Candidate',
                emails: (parsedData as any).email ? [(parsedData as any).email] : [],
                phones: (parsedData as any).phone ? [(parsedData as any).phone] : [],
                parsed: parsedData,
                resume: {
                    filename: req.file.originalname,
                    size: req.file.size,
                    storage: 'local' // or gridfs
                }
            });

            res.status(201).json(candidate);

        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
];

// ... existing code ...


export const createCandidate = async (req: AuthRequest, res: Response) => {
    try {
        const candidate = await Candidate.create({
            ...req.body,
            orgId: req.user.organizationId
        });
        // Trigger Resume Parsing Job here (via Bull/Redis) - TODO
        res.status(201).json(candidate);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getCandidates = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId, stage } = req.query;
        const query: any = { orgId: req.user.organizationId };
        if (jobId) query.positionApplied = jobId;
        if (stage) query.stage = stage;

        const candidates = await Candidate.find(query)
            .populate('positionApplied', 'title')
            .sort({ createdAt: -1 });
        res.json(candidates);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('positionApplied', 'title');
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json(candidate);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStage = async (req: Request, res: Response) => {
    try {
        const { stage } = req.body;
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { stage },
            { new: true }
        );
        res.json(candidate);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCandidate = async (req: Request, res: Response) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json(candidate);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCandidate = async (req: Request, res: Response) => {
    try {
        const candidate = await Candidate.findByIdAndDelete(req.params.id);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json({ message: 'Candidate removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
