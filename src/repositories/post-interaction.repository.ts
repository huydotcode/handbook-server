import PostInteraction, {
    IPostInteractionModel,
} from '../models/post-interaction.model';
import { BaseRepository } from './base.repository';

export class PostInteractionRepository extends BaseRepository<IPostInteractionModel> {
    constructor() {
        super(PostInteraction);
    }
}
