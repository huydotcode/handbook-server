import { Schema, model, models } from 'mongoose';

interface IItemModel {
    name: string;
    seller: Schema.Types.ObjectId;
    description: string;
    price: number;
    images: Schema.Types.ObjectId[];
    location: Schema.Types.ObjectId;
    category: Schema.Types.ObjectId;
    slug: string;
    status: string;
    attributes: {
        name: string;
        value: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export const ItemSchema = new Schema<IItemModel>(
    {
        name: {
            type: String,
            required: true,
        },
        seller: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        images: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Media',
            },
        ],
        location: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
        category: {
            ref: 'Category',
            type: Schema.Types.ObjectId,
            required: true,
        },
        slug: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        attributes: [
            {
                name: {
                    type: String,
                    required: true,
                },
                value: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

ItemSchema.index({ name: 'text' }); // Index for search
ItemSchema.index({ slug: 1 }, { unique: true }); // Unique index for slug
ItemSchema.index({ name: 1 }); // Index for name search
ItemSchema.index({ seller: 1 }); // Index for seller
ItemSchema.index({ category: 1 }); // Index for category

const Item = models.Item || model<IItemModel>('Item', ItemSchema);

export default Item;
