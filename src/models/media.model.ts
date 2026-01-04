import { Document, Schema, Types, model, models } from 'mongoose';

export interface IMediaModel extends Document {
    _id: string;
    publicId: string;
    width: number;
    height: number;
    resourceType: string;
    type: string;
    url: string;
    creator: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMediaInput {
    publicId: string;
    width: number;
    height: number;
    resourceType: string;
    type: string;
    url: string;
    creator: Types.ObjectId;
}

export interface IMediaOutput extends IMediaInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export const MediaSchema = new Schema<IMediaModel>(
    {
        publicId: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        resourceType: { type: String, required: true },
        type: { type: String, required: true },
        url: { type: String, required: true },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

MediaSchema.index({ creator: 1 });

const Media = models.Media || model<IMediaModel>('Media', MediaSchema);

export default Media;
