import Media, { IMediaModel } from '../models/media.model';
import { BaseRepository } from './base.repository';

export class MediaRepository extends BaseRepository<IMediaModel> {
    constructor() {
        super(Media);
    }
}
