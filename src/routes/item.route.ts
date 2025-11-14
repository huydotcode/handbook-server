import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const itemRouter = Router();
const itemController = new ItemController();

const itemRoutes: IApiRoute[] = [
    {
        path: '/',
        method: EApiMethod.GET,
        controller: itemController.getAllItems,
    },
    {
        path: '/seller/:sellerId',
        method: EApiMethod.GET,
        controller: itemController.getItemsBySeller,
    },
    {
        path: '/search',
        method: EApiMethod.GET,
        controller: itemController.searchItems,
    },
];

addRoutes(itemRouter, itemRoutes);

export default itemRouter;
