import mongoose, { Schema, Document } from 'mongoose';

export interface ITalentPool extends Document {
    orgId: mongoose.Types.ObjectId;
    name: string;
    role: string;
    skills: string[];
    status: 'Available' | 'Reviewing' | 'Contacted' | 'Hired';
    email: string;
    phone?: string;
}

const TalentPoolSchema: Schema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    skills: [{ type: String }],
    status: { type: String, enum: ['Available', 'Reviewing', 'Contacted', 'Hired', 'Blacklisted'], default: 'Available' },
    email: { type: String, required: true },
    phone: String,
    // Advanced Fields
    experience: { type: Number }, // Years
    location: { type: String },
    linkedIn: { type: String },
    resumeUrl: { type: String },
    source: { type: String }, // e.g. LinkedIn, Referral
    notes: { type: String },
    tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<ITalentPool>('TalentPool', TalentPoolSchema);
