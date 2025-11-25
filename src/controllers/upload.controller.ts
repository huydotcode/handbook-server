import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getAuthenticatedUserId,
    validateRequiredParam,
} from '../common/utils/controller.helper';
import { UploadService } from '../services/upload.service';
import { AppError } from '../common/errors/app.error';
import { HTTP_STATUS } from '../common/constants/status-code';

/**
 * Controller for handling media uploads.
 */
export class UploadController {
    private uploadService: UploadService;

    constructor() {
        this.uploadService = new UploadService();
    }

    /**
     * POST /api/v1/upload/image
     * Upload an image to Cloudinary and store its metadata.
     */
    public uploadImage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const file = req.file;

            const media = await this.uploadService.uploadImage(
                {
                    buffer: file?.buffer as Buffer,
                    originalname: file?.originalname || '',
                    mimetype: file?.mimetype || '',
                    size: file?.size || 0,
                },
                userId
            );

            ResponseUtil.created(res, media, 'Image uploaded successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/upload/video
     * Upload a video to Cloudinary and store its metadata.
     */
    public uploadVideo = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const file = req.file;

            const media = await this.uploadService.uploadVideo(
                {
                    buffer: file?.buffer as Buffer,
                    originalname: file?.originalname || '',
                    mimetype: file?.mimetype || '',
                    size: file?.size || 0,
                },
                userId
            );

            ResponseUtil.created(res, media, 'Video uploaded successfully');
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/images/:id
     * Get image URL by ID.
     */
    public getImageById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const imageId = req.params.id;
            validateRequiredParam(imageId, 'Image ID');

            const result = await this.uploadService.getImageById(imageId);

            ResponseUtil.success(
                res,
                result,
                'Image URL retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/images?url=:imageUrl
     * Delete image from Cloudinary.
     */
    public deleteImageByUrl = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const imageUrl = req.query.url as string;
            if (!imageUrl) {
                throw new AppError(
                    'Image URL is required',
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            const userId = getAuthenticatedUserId(req);

            await this.uploadService.deleteImageByUrl(imageUrl, userId);

            ResponseUtil.success(
                res,
                { success: true },
                'Image deleted successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
