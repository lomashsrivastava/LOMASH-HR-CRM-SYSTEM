import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
    orgId: mongoose.Types.ObjectId;
    title: string;
    type: string;
    duration: string;
    status: 'Active' | 'Draft' | 'Archived';
    questions: any[];
    candidates: mongoose.Types.ObjectId[];
}

const QuestionSchema = new Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'text', 'code'], required: true },
    options: [{ type: String }], // For MCQ
    correctAnswer: { type: String },
    points: { type: Number, default: 10 }
});

const AssessmentSchema: Schema = new Schema({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true }, // e.g., 'Technical', 'Psychometric'
    duration: { type: String, required: true }, // e.g. '60' (minutes)
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Draft' },
    questions: [QuestionSchema],
    passingScore: { type: Number, default: 70 },
    candidates: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }]
}, { timestamps: true });

export default mongoose.model<IAssessment>('Assessment', AssessmentSchema);
