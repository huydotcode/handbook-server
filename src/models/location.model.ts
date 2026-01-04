import { Document, Schema, model, models } from 'mongoose';

export interface ILocationModel extends Document {
    _id: string;
    name: string;
    slug: string;
    type: string;
    nameWithType: string;
    code: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILocationInput {
    name: string;
    slug: string;
    type: string;
    nameWithType: string;
    code: string;
}

export interface ILocationOutput extends ILocationInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export const LocationSchema = new Schema<ILocationModel>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        type: { type: String, required: true },
        nameWithType: { type: String, required: true },
        code: { type: String, required: true },
    },
    { timestamps: true }
);

LocationSchema.index({ slug: 1 }, { unique: true });
LocationSchema.index({ name: 1 });

const Location =
    models.Location || model<ILocationModel>('Location', LocationSchema);

export default Location;
