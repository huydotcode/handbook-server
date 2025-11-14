import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { getDecodedTokenFromRequest } from '../common/utils/jwt';
import { UploadService } from '../services/upload.service';
import { UnauthorizedError } from '../common/errors/app.error';

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
            const userId = this.getUserId(req);
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
            const userId = this.getUserId(req);
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

    private getUserId(req: Request): string {
        if (req.user?.id) {
            return req.user.id;
        }

        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded?.id) {
            throw new UnauthorizedError('Unauthorized');
        }

        return decoded.id;
    }
}
