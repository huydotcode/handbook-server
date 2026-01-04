import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const locationRouter = Router();
const locationController = new LocationController();

const locationRoutes: IApiRoute[] = [
    // Collection routes
    {
        path: '/',
        method: EApiMethod.POST,
        controller: locationController.createLocation,
        isAdminRoute: true,
        isRateLimited: true,
    },
    {
        path: '/',
        method: EApiMethod.GET,
        controller: locationController.getLocations,
        isRateLimited: true,
    },
];

addRoutes(locationRouter, locationRoutes);

export default locationRouter;
