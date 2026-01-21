import {
    CLOUDINARY_DEFAULT_FOLDER,
    cloudinaryClient,
} from '../common/config/cloudinary';
import { HTTP_STATUS } from '../common/constants/status-code';
import { AppError, ValidationError } from '../common/errors/app.error';
import { IMediaModel } from '../models/media.model';
import { MediaService } from './media.service';

export interface UploadPayload {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

export class UploadService {
    private mediaService: MediaService;

    constructor() {
        this.mediaService = new MediaService();
    }

    /**
     * Upload an image to Cloudinary and persist metadata.
     */
    async uploadImage(
        file: UploadPayload,
        userId: string
    ): Promise<IMediaModel> {
        this.validateFile(file, ['image/']);

        const uploadResult = await this.uploadToCloudinary(
            file,
            userId,
            'image'
        );

        return this.mediaService.createMedia(
            {
                publicId: uploadResult.public_id,
                width: uploadResult.width,
                height: uploadResult.height,
                resourceType: uploadResult.resource_type,
                type: uploadResult.format,
                url: uploadResult.secure_url,
            },
            userId
        );
    }

    /**
     * Upload a video to Cloudinary and persist metadata.
     */
    async uploadVideo(
        file: UploadPayload,
        userId: string
    ): Promise<IMediaModel> {
        this.validateFile(file, ['video/']);

        const uploadResult = await this.uploadToCloudinary(
            file,
            userId,
            'video'
        );

        return this.mediaService.createMedia(
            {
                publicId: uploadResult.public_id,
                width: uploadResult.width,
                height: uploadResult.height,
                resourceType: uploadResult.resource_type,
                type: uploadResult.format,
                url: uploadResult.secure_url,
            },
            userId
        );
    }

    private async uploadToCloudinary(
        file: UploadPayload,
        userId: string,
        resourceType: 'image' | 'video'
    ): Promise<any> {
        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinaryClient.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: `${CLOUDINARY_DEFAULT_FOLDER}/${resourceType}s/${userId}`,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            uploadStream.end(file.buffer);
        });
    }

    private validateFile(
        file: UploadPayload | undefined,
        allowedTypes: string[]
    ) {
        if (!file) {
            throw new ValidationError('File is required');
        }

        const isAllowed = allowedTypes.some((type) =>
            file.mimetype.toLowerCase().startsWith(type)
        );

        if (!isAllowed) {
            throw new ValidationError('Invalid file type');
        }

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            throw new ValidationError('File size exceeds the limit of 50MB');
        }
    }

    /**
     * Get image URL by ID
     * @param imageId - Image ID
     * @returns Image URL
     */
    async getImageById(imageId: string): Promise<{ url: string }> {
        const media = await this.mediaService.getMediaById(imageId);
        return { url: media.url };
    }

    /**
     * Delete image from Cloudinary by URL
     * @param imageUrl - Image URL
     * @param userId - User ID performing the action
     * @returns True if deleted
     */
    async deleteImageByUrl(imageUrl: string, userId: string): Promise<boolean> {
        if (!imageUrl || imageUrl.trim().length === 0) {
            throw new ValidationError('Image URL is required');
        }

        // Extract public_id from URL
        const publicId = this.extractPublicIdFromUrl(imageUrl);

        if (!publicId) {
            throw new AppError('Invalid image URL', HTTP_STATUS.BAD_REQUEST);
        }

        // Delete from Cloudinary
        return await new Promise((resolve, reject) => {
            cloudinaryClient.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    reject(
                        new AppError(
                            `Failed to delete image: ${error.message}`,
                            HTTP_STATUS.INTERNAL_SERVER_ERROR
                        )
                    );
                } else {
                    // Also delete from database if media exists
                    this.mediaService.deleteMediaByUrl(imageUrl).catch(() => {
                        // Ignore database deletion errors
                    });
                    resolve(result.result === 'ok');
                }
            });
        });
    }

    /**
     * Extract public_id from Cloudinary URL
     * @param url - Cloudinary URL
     * @returns Public ID or null
     */
    private extractPublicIdFromUrl(url: string): string | null {
        try {
            // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/{type}/v{version}/{public_id}.{format}
            // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
            const urlParts = url.split('/');
            const uploadIndex = urlParts.findIndex((part) => part === 'upload');
            if (uploadIndex === -1) {
                return null;
            }

            // Get parts after 'upload' and before the file extension
            const afterUpload = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
            if (afterUpload.length === 0) {
                return null;
            }

            // Join and remove file extension
            let publicId = afterUpload.join('/');
            const lastDotIndex = publicId.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                publicId = publicId.substring(0, lastDotIndex);
            }

            return publicId;
        } catch (error) {
            return null;
        }
    }
    /**
     * Upload multiple files
     * @param files - Array of files to upload
     * @param userId - User ID performing the action
     * @returns Array of uploaded media
     */
    async uploadFiles(
        files: UploadPayload[],
        userId: string
    ): Promise<IMediaModel[]> {
        const uploadPromises = files.map((file) => {
            if (file.mimetype.startsWith('video/')) {
                return this.uploadVideo(file, userId);
            } else {
                return this.uploadImage(file, userId);
            }
        });

        return await Promise.all(uploadPromises);
    }
}
