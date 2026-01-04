import Location, { ILocationModel } from '../models/location.model';
import { BaseRepository } from './base.repository';

export class LocationRepository extends BaseRepository<ILocationModel> {
    constructor() {
        super(Location);
    }
}
