import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    orgId: mongoose.Types.ObjectId;
    name: string;
    emails: string[];
    phones: string[];
    positionApplied: mongoose.Types.ObjectId; // Job ID
    stage: string;
    source: string;
    tags: string[];
    resume: {
        fileId: mongoose.Types.ObjectId;
        storage: 'gridfs' | 's3';
        filename: string;
        size: number;
        url?: string;
    };
    parsed: {
        skills: string[];
        expYears: number;
        education: any[];
        companies: string[];
    };
    scores: {
        userId: mongoose.Types.ObjectId;
        rubricId: string;
        values: any;
        finalScore: number;
        comments: string;
    }[];
    finalScore: number;
    assignedTo: mongoose.Types.ObjectId[];
    timeline: {
        action: string;
        details: string;
        performedBy: mongoose.Types.ObjectId;
        timestamp: Date;
    }[];
    notes: {
        text: string;
        authorId: mongoose.Types.ObjectId;
        createdAt: Date;
    }[];
    isTalentPool: boolean;
    priority: boolean;
    noticePeriod?: string;
    expectedSalary?: string;
    linkedin?: string;
    interviewDate?: Date;
    rejectionReason?: string;
    ratings: number;
}

const CandidateSchema: Schema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    emails: [{ type: String }],
    phones: [{ type: String }],
    positionApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    stage: { type: String, enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'archived'], default: 'applied' },
    resume: {
        url: String,
        text: String
    },
    // Advanced Features Fields
    priority: { type: Boolean, default: false }, // Star/Favorite
    tags: [{ type: String }], // e.g. "Urgent", "Senior"
    source: { type: String, default: 'Direct' }, // LinkedIn, Referral
    noticePeriod: { type: String }, // e.g. "30 Days"
    expectedSalary: { type: String },
    linkedin: { type: String },
    interviewDate: { type: Date },
    rejectionReason: { type: String },
    ratings: { type: Number, default: 0 }, // 1-5 star
    parsed: {
        skills: [String],
        expYears: Number,
        education: [Object],
        companies: [String]
    },
    scores: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rubricId: String,
        values: Object,
        finalScore: Number,
        comments: String
    }],
    finalScore: { type: Number, default: 0 },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    timeline: [{
        action: String, // 'status_change', 'note', 'email', 'upload'
        details: String,
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now }
    }],
    notes: [{
        text: String,
        authorId: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    isTalentPool: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for search
CandidateSchema.index({ name: 'text', 'parsed.skills': 'text', emails: 'text' });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
