import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getPaginationParams,
    validateRequiredParam,
} from '../common/utils/controller.helper';
import { MediaService } from '../services/media.service';

/**
 * Controller for handling media-related HTTP requests (admin only).
 */
export class MediaController {
    private mediaService: MediaService;

    constructor() {
        this.mediaService = new MediaService();
    }

    /**
     * GET /api/v1/medias (Admin only)
     * Get all medias with pagination.
     */
    public getAllMedias = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { page, pageSize } = getPaginationParams(req, 20);

            const result = await this.mediaService.getAllMedias(page, pageSize);

            ResponseUtil.paginated(
                res,
                result.data,
                result.pagination,
                'Medias retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/medias/:id (Admin only)
     * Delete media by ID.
     */
    public deleteMedia = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const mediaId = req.params.id;
            validateRequiredParam(mediaId, 'Media ID');
            // Admin middleware will handle authentication
            // We'll use a placeholder userId since admin can delete any media
            const userId = (req as any).user?.userId || 'admin';

            await this.mediaService.deleteMedia(mediaId, userId);

            ResponseUtil.success(
                res,
                { success: true },
                'Media deleted successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
