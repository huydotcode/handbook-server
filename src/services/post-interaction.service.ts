import { Types } from 'mongoose';
import { NotFoundError } from '../common/errors/app.error';
import {
    EPostInteractionType,
    IPostInteractionModel,
} from '../models/post-interaction.model';
import { PostInteractionRepository } from '../repositories/post-interaction.repository';
import { BaseService } from './base.service';

export class PostInteractionService extends BaseService<IPostInteractionModel> {
    private postInteractionRepository: PostInteractionRepository;

    constructor() {
        const repository = new PostInteractionRepository();
        super(repository);
        this.postInteractionRepository = repository;
    }

    /**
     * Create a new post interaction
     * @param data - Post interaction data
     * @param userId - User ID performing the action
     * @returns Created post interaction
     */
    async createPostInteraction(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, ['user', 'post', 'type']);

        // Set user from userId
        data.user = userId;

        return await this.create(data, userId);
    }

    /**
     * Toggle interaction (add if not exists, remove if exists)
     * @param postId - Post ID
     * @param userId - User ID
     * @param type - Interaction type
     * @returns Created or deleted interaction
     */
    async toggleInteraction(
        postId: string,
        userId: string,
        type: EPostInteractionType
    ) {
        this.validateId(postId);
        this.validateId(userId, 'User ID');

        // Check if interaction already exists
        const existingInteraction =
            await this.postInteractionRepository.findOne({
                user: userId,
                post: postId,
                type,
            });

        if (existingInteraction) {
            // Remove interaction
            const deleted = await this.postInteractionRepository.delete(
                existingInteraction._id as string
            );
            if (!deleted) {
                throw new NotFoundError(
                    `Interaction not found with id: ${existingInteraction._id}`
                );
            }
            return { action: 'removed', interaction: null };
        } else {
            // Create interaction
            const interaction = await this.create(
                {
                    user: new Types.ObjectId(userId),
                    post: new Types.ObjectId(postId),
                    type,
                },
                userId
            );
            return { action: 'added', interaction };
        }
    }

    /**
     * Get interactions by post
     * @param postId - Post ID
     * @param type - Interaction type (optional)
     * @returns Array of interactions
     */
    async getInteractionsByPost(postId: string, type?: EPostInteractionType) {
        this.validateId(postId);

        const filter: any = { post: postId };
        if (type) {
            filter.type = type;
        }

        return await this.postInteractionRepository.findMany(filter);
    }

    /**
     * Get user interactions
     * @param userId - User ID
     * @param type - Interaction type (optional)
     * @returns Array of interactions
     */
    async getUserInteractions(userId: string, type?: EPostInteractionType) {
        this.validateId(userId, 'User ID');

        const filter: any = { user: userId };
        if (type) {
            filter.type = type;
        }

        return await this.postInteractionRepository.findManyWithSort(filter, {
            createdAt: -1,
        });
    }

    /**
     * Check if user has interacted with post
     * @param postId - Post ID
     * @param userId - User ID
     * @param type - Interaction type
     * @returns True if user has interacted
     */
    async hasUserInteracted(
        postId: string,
        userId: string,
        type: EPostInteractionType
    ) {
        this.validateId(postId);
        this.validateId(userId, 'User ID');

        const interaction = await this.postInteractionRepository.findOne({
            user: userId,
            post: postId,
            type,
        });

        return !!interaction;
    }

    /**
     * Get interaction counts for a post
     * @param postId - Post ID
     * @returns Object with counts for each type
     */
    async getInteractionCounts(postId: string) {
        this.validateId(postId);

        const interactions = await this.postInteractionRepository.findMany({
            post: postId,
        });

        const counts = {
            [EPostInteractionType.LOVE]: 0,
            [EPostInteractionType.SHARE]: 0,
            [EPostInteractionType.COMMENT]: 0,
            [EPostInteractionType.SAVE]: 0,
        };

        interactions.forEach((interaction) => {
            counts[interaction.type as EPostInteractionType]++;
        });

        return counts;
    }
}
