import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const itemRouter = Router();
const itemController = new ItemController();

const itemRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/seller/:sellerId',
        method: EApiMethod.GET,
        controller: itemController.getItemsBySeller,
        isRateLimited: true,
    },
    {
        path: '/search',
        method: EApiMethod.GET,
        controller: itemController.searchItems,
        isRateLimited: true,
    },
    // Collection routes
    {
        path: '/',
        method: EApiMethod.POST,
        controller: itemController.createItem,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/',
        method: EApiMethod.GET,
        controller: itemController.getAllItems,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.PUT,
        controller: itemController.updateItem,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.DELETE,
        controller: itemController.deleteItem,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: itemController.getItemById,
        isRateLimited: true,
    },
];

addRoutes(itemRouter, itemRoutes);

export default itemRouter;
