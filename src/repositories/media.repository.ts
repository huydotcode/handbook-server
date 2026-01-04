import { PaginationResult } from '../common/types/base';
import Media, { IMediaModel } from '../models/media.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';

export class MediaRepository extends BaseRepository<IMediaModel> {
    constructor() {
        super(Media);
    }

    /**
     * Find all medias with pagination (admin only)
     */
    async findAllPaginated(
        page: number,
        pageSize: number
    ): Promise<PaginationResult<IMediaModel>> {
        const skip = (page - 1) * pageSize;

        const [medias, total] = await Promise.all([
            this.model
                .find({})
                .populate('creator', POPULATE_USER)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.model.countDocuments({}),
        ]);

        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: medias,
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
}
