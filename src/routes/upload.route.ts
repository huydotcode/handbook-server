import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import {
    multerImageMiddleware,
    multerVideoMiddleware,
} from '../middlewares/multer.middleware';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const uploadRouter = Router();
const uploadController = new UploadController();

const uploadRoutes: IApiRoute[] = [
    {
        path: '/image',
        method: EApiMethod.POST,
        controller: uploadController.uploadImage,
        middlewares: multerImageMiddleware,
        isPrivateRoute: true,
    },
    {
        path: '/video',
        method: EApiMethod.POST,
        controller: uploadController.uploadVideo,
        middlewares: multerVideoMiddleware,
        isPrivateRoute: true,
    },
];

addRoutes(uploadRouter, uploadRoutes);

export default uploadRouter;
