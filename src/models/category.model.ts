import { Document, Schema, model, models } from 'mongoose';

export interface ICategoryModel extends Document {
    _id: string;
    name: string;
    description: string;
    slug: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategoryInput {
    name: string;
    description: string;
    slug: string;
    icon: string;
}

export interface ICategoryOutput extends ICategoryInput {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export const CategorySchema = new Schema<ICategoryModel>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ name: 1 });

const Category =
    models.Category || model<ICategoryModel>('Category', CategorySchema);

export default Category;
