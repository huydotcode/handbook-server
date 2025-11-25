import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const imageRouter = Router();
const uploadController = new UploadController();

const imageRoutes: IApiRoute[] = [
    // Dynamic routes
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: uploadController.getImageById,
        isRateLimited: true,
    },
    // Collection routes (query parameter)
    {
        path: '/',
        method: EApiMethod.DELETE,
        controller: uploadController.deleteImageByUrl,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(imageRouter, imageRoutes);

export default imageRouter;
