import { ILocationModel } from '../models/location.model';
import { BaseService } from './base.service';
import { LocationRepository } from '../repositories/location.repository';
import { NotFoundError } from '../common/errors/app.error';

export class LocationService extends BaseService<ILocationModel> {
    private locationRepository: LocationRepository;

    constructor() {
        const repository = new LocationRepository();
        super(repository);
        this.locationRepository = repository;
    }

    /**
     * Create a new location
     * @param data - Location data
     * @param userId - User ID performing the action
     * @returns Created location
     */
    async createLocation(data: any, userId: string) {
        // Validate required fields
        this.validateRequiredFields(data, ['name', 'slug', 'type', 'code']);

        return await this.create(data, userId);
    }

    /**
     * Get location by slug
     * @param slug - Location slug
     * @returns Location or null
     */
    async getLocationBySlug(slug: string) {
        const location = await this.locationRepository.findOne({ slug });
        if (!location) {
            throw new NotFoundError(`Location not found with slug: ${slug}`);
        }
        return location;
    }

    /**
     * Get locations by type
     * @param type - Location type
     * @param sortOrder - Sort order
     * @returns Array of locations
     */
    async getLocationsByType(
        type: string,
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<ILocationModel[]> {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        return await this.locationRepository.findManyWithSort(
            { type },
            { name: sortDirection }
        );
    }

    /**
     * Get all locations sorted by name.
     */
    async getAllLocations(
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<ILocationModel[]> {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        return await this.locationRepository.findManyWithSort(
            {},
            { name: sortDirection }
        );
    }
}
