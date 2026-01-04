import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
    name: string;
    domain: string;
    settings: {
        scoringTemplates: any[];
        integrations: any;
    };
    createdAt: Date;
}

const OrganizationSchema: Schema = new Schema({
    name: { type: String, required: true },
    domain: { type: String, unique: true },
    settings: {
        scoringTemplates: { type: Array, default: [] },
        integrations: { type: Object, default: {} }
    }
}, { timestamps: true });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
