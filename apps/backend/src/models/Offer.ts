import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
    orgId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    role: string;
    department: string;
    salary: number;
    bonus: number;
    equity: string;
    benefits: string[];
    joiningDate: Date;
    expiryDate: Date;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Withdrawn' | 'Expired';
    sentDate?: Date;
    notes: string;
}

const OfferSchema: Schema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    role: { type: String, required: true },
    department: { type: String },
    salary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    equity: { type: String },
    benefits: [{ type: String }],
    joiningDate: { type: Date },
    expiryDate: { type: Date },
    status: { type: String, enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Withdrawn', 'Expired'], default: 'Draft' },
    sentDate: { type: Date },
    notes: { type: String }
}, { timestamps: true });

export default mongoose.model<IOffer>('Offer', OfferSchema);
