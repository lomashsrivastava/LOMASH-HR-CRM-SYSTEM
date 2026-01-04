import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Organization from '../models/Organization';

export const generateToken = (id: string, role: string, orgId?: string) => {
    return jwt.sign({ id, role, organizationId: orgId }, process.env.JWT_SECRET || 'dev_secret_key_123', {
        expiresIn: (process.env.JWT_EXPIRES || '1d') as any,
    });
};

const generateEmployeeId = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    let id = '';

    if (parts.length >= 2) {
        const firstName = parts[0];
        const lastName = parts[parts.length - 1]; // Use the last part as the last name

        const f1 = firstName.charAt(0);
        const l1 = lastName.charAt(0);
        const f2 = firstName.charAt(firstName.length - 1);
        const l2 = lastName.charAt(lastName.length - 1);

        id = `${f1}${l1}${f2}${l2}`;
    } else {
        // Fallback for single name: First + First + Last + Last
        const n = parts[0];
        id = `${n.charAt(0)}${n.charAt(0)}${n.charAt(n.length - 1)}${n.charAt(n.length - 1)}`;
    }

    return id.toUpperCase();
};

export const register = async (req: Request, res: Response) => {
    try {
        console.log('Register request:', req.body);
        const { name, email, password, role, orgName, employeeId } = req.body;

        const emailLower = email.toLowerCase(); // Enforce lowercase

        const userExists = await User.findOne({ email: emailLower });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check or create organization
        let orgId = null;
        if (orgName) {
            const domain = emailLower.split('@')[1];
            let org = await Organization.findOne({ domain }); // specific lookup

            if (!org) {
                try {
                    org = await Organization.create({ name: orgName, domain });
                } catch (err: any) {
                    if (err.code === 11000) {
                        org = await Organization.findOne({ domain });
                    } else {
                        throw err;
                    }
                }
            }
            orgId = org?._id;
        }

        // Use provided employeeId (from frontend generation/logic) or generate if missing (fallback)
        // Frontend sends it now but let's be safe
        const finalEmployeeId = employeeId ? employeeId : generateEmployeeId(name);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: emailLower,
            employeeId: finalEmployeeId,
            passwordHash,
            role: role || 'recruiter',
            organizationId: orgId
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            employeeId: user.employeeId,
            role: user.role,
            organizationId: orgId,
            token: generateToken(user._id.toString(), user.role, orgId?.toString()),
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, employeeId } = req.body;

        if (!email || !password || !employeeId) {
            return res.status(400).json({ message: 'Please provide Email, Password, and Employee ID.' });
        }

        const emailLower = email.toLowerCase(); // Enforce lowercase
        const user = await User.findOne({ email: emailLower });

        if (!user) {
            console.log(`Login failed: User not found for email "${emailLower}"`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (await bcrypt.compare(password, user.passwordHash)) {
            // Check Employee ID
            console.log(`Verifying EmployeeID - Stored: "${user.employeeId}", Provided: "${employeeId}"`);

            if (user.employeeId?.trim() !== employeeId?.trim()) {
                console.log('Login failed: Employee ID mismatch');
                return res.status(401).json({ message: 'Invalid Employee ID.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                employeeId: user.employeeId,
                role: user.role,
                organizationId: user.organizationId,
                token: generateToken(user._id.toString(), user.role, user.organizationId?.toString()),
            });
        } else {
            console.log(`Login failed: Invalid password for "${emailLower}"`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
