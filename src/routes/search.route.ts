import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const searchRouter = Router();
const searchController = new SearchController();

const searchRoutes: IApiRoute[] = [
    {
        path: '/',
        method: EApiMethod.GET,
        controller: searchController.search,
    },
    {
        path: '/users',
        method: EApiMethod.GET,
        controller: searchController.searchUsers,
    },
    {
        path: '/posts',
        method: EApiMethod.GET,
        controller: searchController.searchPosts,
    },
    {
        path: '/groups',
        method: EApiMethod.GET,
        controller: searchController.searchGroups,
    },
];

addRoutes(searchRouter, searchRoutes);

export default searchRouter;
