import { z } from 'zod';

export const MAX_FILE_COUNT = 5;

// Create post validation
export const createPostValidation = z.object({
    content: z.string().min(1, 'Nội dung không được để trống'),
    option: z.string().optional(),

    files: z
        .array(z.any())
        .max(MAX_FILE_COUNT, `Chỉ được chọn tối đa ${MAX_FILE_COUNT} file`)
        .optional(),
    tags: z.array(z.string().min(1, 'Tag không được để trống')).optional(),
});

export type CreatePostValidation = z.infer<typeof createPostValidation>;

// Edit post validation
export const editPostValidation = z.object({
    content: z.string().min(1, 'Nội dung không được để trống'),
    option: z.string().optional(),
    files: z
        .array(z.any())
        .max(MAX_FILE_COUNT, `Chỉ được chọn tối đa ${MAX_FILE_COUNT} file`)
        .optional(),
    tags: z.array(z.string().min(1, 'Tag không được để trống')).optional(),
    status: z.string().optional(),
});

export type EditPostValidation = z.infer<typeof editPostValidation>;
