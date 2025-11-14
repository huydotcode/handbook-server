import { cloudinaryClient } from '../common/config/cloudinary';
import { MediaService } from './media.service';
import { ValidationError } from '../common/errors/app.error';
import { IMediaModel } from '../models/media.model';

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
                    folder: `handbook/${resourceType}s/${userId}`,
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
}
