import Profile, { IProfileModel } from '../models/profile.model';
import { BaseRepository } from './base.repository';

export class ProfileRepository extends BaseRepository<IProfileModel> {
    constructor() {
        super(Profile);
    }
}
