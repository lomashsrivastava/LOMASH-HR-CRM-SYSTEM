import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    organizationId: mongoose.Types.ObjectId;
    name: string;
    role: string;
    department: string;
    email: string;
    status: 'Present' | 'Absent' | 'Remote';
    checkInTime?: string;
    joinedAt: Date;
}

const EmployeeSchema: Schema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Present', 'Absent', 'On Leave', 'Remote'], default: 'Absent' },
    checkInTime: { type: String },
    // Advanced Features
    performance: { type: Number, default: 0 }, // 1-5 Rating
    joinDate: { type: Date, default: Date.now },
    workMode: { type: String, enum: ['Onsite', 'Remote', 'Hybrid'], default: 'Onsite' },
    employmentType: { type: String, enum: ['Full-Time', 'Contract', 'Intern'], default: 'Full-Time' },
    skills: [{ type: String }],
    emergencyContact: { type: String },
    salary: { type: Number },
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
