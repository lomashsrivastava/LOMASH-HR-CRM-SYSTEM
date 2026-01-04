import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    orgId: mongoose.Types.ObjectId;
    title: string;
    department: string;
    locations: string[];
    employmentType: string;
    description: string;
    jdText: string; // for ML parsing
    tags: string[];
    hiringManagers: mongoose.Types.ObjectId[];
    status: 'draft' | 'open' | 'closed' | 'archived';
    openDate: Date;
    closeDate?: Date;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    experienceLevel?: 'Intern' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
    workMode?: 'On-site' | 'Remote' | 'Hybrid';
}

const JobSchema: Schema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    department: { type: String },
    locations: [{ type: String }],
    employmentType: { type: String, default: 'Full-time' },
    description: { type: String },
    jdText: { type: String },
    tags: [{ type: String }],
    hiringManagers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['draft', 'open', 'closed', 'archived'], default: 'draft' },
    openDate: { type: Date, default: Date.now },
    closeDate: { type: Date },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: 'USD' },
    experienceLevel: { type: String, enum: ['Intern', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'], default: 'Mid' },
    workMode: { type: String, enum: ['On-site', 'Remote', 'Hybrid'], default: 'On-site' }
}, { timestamps: true });

export default mongoose.model<IJob>('Job', JobSchema);
