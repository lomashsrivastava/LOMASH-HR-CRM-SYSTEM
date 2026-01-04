import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Organization from '../models/Organization';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateToken } from './auth.controller';

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const users = await User.find({ organizationId: currentUser?.organizationId }).select('-passwordHash');
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addUser = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Fetch fresh organization ID from DB if not in token
        let orgId = req.user.organizationId;
        if (!orgId) {
            const currentUser = await User.findById(req.user.id);
            orgId = currentUser?.organizationId;
        }

        // If still no orgId, we can't add a user to the team.
        // NOTE: For now, avoiding strict failure to allow users to play around, 
        // but ideally we should enforce organization membership.
        // if (!orgId) ...

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role: role || 'recruiter',
            organizationId: orgId
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user.id).populate('organizationId');
        if (!user || !user.organizationId) {
            return res.json({ name: '' });
        }
        res.json(user.organizationId);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let org;
        if (user.organizationId) {
            org = await Organization.findByIdAndUpdate(user.organizationId, { name }, { new: true });
        } else {
            // Create new org
            const domain = user.email.split('@')[1];
            org = await Organization.create({ name, domain });
            user.organizationId = org._id as any;
            await user.save();
        }

        // Generate new token with updated orgId
        const token = generateToken(user._id.toString(), user.role, org?._id.toString());

        res.json({
            organization: org,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: org?._id
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
