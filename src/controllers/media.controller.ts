import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import { MediaService } from '../services/media.service';
import { BaseController } from './base.controller';

/**
 * Controller for handling media-related HTTP requests (admin only).
 */
export class MediaController extends BaseController {
    private mediaService: MediaService;

    constructor() {
        super();
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
            const { page, pageSize } = this.getPaginationParams(req, 20);

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
            this.validateRequiredParam(mediaId, 'Media ID');
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
