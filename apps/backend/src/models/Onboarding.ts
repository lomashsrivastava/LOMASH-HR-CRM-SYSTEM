import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboarding extends Document {
    orgId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    startDate: Date;
    status: 'Pending' | 'In Progress' | 'Completed';
    tasks: {
        title: string;
        assignee: string; // Could be User ID, but string for simplicity now
        status: 'Pending' | 'In Progress' | 'Completed';
    }[];
}

const OnboardingSchema: Schema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    startDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    tasks: [{
        title: String,
        assignee: String,
        status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
    }]
}, { timestamps: true });

export default mongoose.model<IOnboarding>('Onboarding', OnboardingSchema);
