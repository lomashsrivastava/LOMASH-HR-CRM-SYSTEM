import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    employeeId: string; // Added field
    passwordHash: string;
    role: 'admin' | 'recruiter' | 'interviewer' | 'sourcer' | 'manager' | 'guest';
    organizationId: mongoose.Types.ObjectId;
    preferences: {
        theme: string;
        notifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true }, // Added field
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'recruiter', 'interviewer', 'sourcer', 'manager', 'guest'],
        default: 'recruiter'
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    preferences: {
        theme: { type: String, default: 'neon' },
        notifications: { type: Boolean, default: true }
    }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
