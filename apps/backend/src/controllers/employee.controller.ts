import { Request, Response } from 'express';
import Employee from '../models/Employee';
import { AuthRequest } from '../middleware/auth.middleware';

export const getEmployees = async (req: AuthRequest, res: Response) => {
    try {
        const employees = await Employee.find({ organizationId: req.user.organizationId }).sort({ createdAt: -1 });
        res.json(employees);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const employee = await Employee.create({
            ...req.body,
            organizationId: req.user.organizationId
        });
        res.status(201).json(employee);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkCreateEmployees = async (req: AuthRequest, res: Response) => {
    try {
        const employees = req.body;
        if (!Array.isArray(employees)) {
            return res.status(400).json({ message: 'Input must be an array' });
        }

        const employeesWithOrg = employees.map(e => ({
            ...e,
            organizationId: req.user.organizationId
        }));

        const created = await Employee.insertMany(employeesWithOrg);
        res.status(201).json(created);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
