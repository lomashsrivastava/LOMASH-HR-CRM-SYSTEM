import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
    candidateId: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
    scheduledBy: mongoose.Types.ObjectId;
    interviewers: mongoose.Types.ObjectId[];
    startTime: Date;
    endTime: Date;
    locationType: 'video' | 'phone' | 'in-person';
    meetingLink: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    notes: string;
    feedback: {
        interviewerId: mongoose.Types.ObjectId;
        score: number;
        notes: string;
        createdAt: Date;
    }[];
}

const InterviewSchema: Schema = new Schema({
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    scheduledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    interviewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    locationType: { type: String, enum: ['video', 'phone', 'in-person'], default: 'video' },
    meetingLink: { type: String },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
    notes: { type: String },
    feedback: [{
        interviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
        score: Number,
        notes: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model<IInterview>('Interview', InterviewSchema);
