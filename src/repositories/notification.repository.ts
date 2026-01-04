import Notification, { INotificationModel } from '../models/notification.model';
import { BaseRepository } from './base.repository';
import { POPULATE_USER } from '../common/utils/populate';
import { PaginationResult } from '../common/types/base';

/**
 * Repository handling notification persistence.
 */
export class NotificationRepository extends BaseRepository<INotificationModel> {
    constructor() {
        super(Notification);
    }

    /**
     * Find notifications for a receiver with pagination.
     */
    async findPaginatedByReceiver(
        receiverId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<INotificationModel>> {
        const skip = (page - 1) * pageSize;

        const filter = { receiver: receiverId, isDeleted: false };

        const [notifications, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ createdAt: -1, isRead: 1 })
                .skip(skip)
                .limit(pageSize)
                .populate('sender', POPULATE_USER)
                .populate('receiver', POPULATE_USER)
                .lean(),
            this.model.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: notifications,
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

    /**
     * Find notifications sent by a user (requests) with pagination.
     */
    async findPaginatedBySender(
        senderId: string,
        page: number,
        pageSize: number
    ): Promise<PaginationResult<INotificationModel>> {
        const skip = (page - 1) * pageSize;

        const filter = { sender: senderId, isDeleted: false };

        const [notifications, total] = await Promise.all([
            this.model
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate('sender', POPULATE_USER)
                .populate('receiver', POPULATE_USER)
                .lean(),
            this.model.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / pageSize) || 1;

        return {
            data: notifications,
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
