import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../common/utils/response';
import {
    getAuthenticatedUserId,
    validateRequiredBodyField,
} from '../common/utils/controller.helper';
import { LocationService } from '../services/location.service';

/**
 * Controller responsible for location resources.
 */
export class LocationController {
    private locationService: LocationService;

    constructor() {
        this.locationService = new LocationService();
    }

    /**
     * GET /api/v1/locations
     * Retrieve all locations or filter by type.
     */
    public getLocations = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { type, sort } = req.query;
            const sortOrder =
                (sort as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

            const locations = type
                ? await this.locationService.getLocationsByType(
                      type as string,
                      sortOrder
                  )
                : await this.locationService.getAllLocations(sortOrder);

            ResponseUtil.success(
                res,
                locations,
                'Locations retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/locations (Admin only)
     * Create a new location.
     */
    public createLocation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = getAuthenticatedUserId(req);
            const locationData = req.body;
            validateRequiredBodyField(req.body, 'name');
            validateRequiredBodyField(req.body, 'slug');
            validateRequiredBodyField(req.body, 'type');
            validateRequiredBodyField(req.body, 'code');

            const location = await this.locationService.createLocation(
                locationData,
                userId
            );

            ResponseUtil.created(
                res,
                location,
                'Location created successfully'
            );
        } catch (error) {
            next(error);
        }
    };
}
