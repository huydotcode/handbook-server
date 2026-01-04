import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const searchRouter = Router();
const searchController = new SearchController();

const searchRoutes: IApiRoute[] = [
    {
        path: '/users',
        method: EApiMethod.GET,
        controller: searchController.searchUsers,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/groups',
        method: EApiMethod.GET,
        controller: searchController.searchGroups,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/posts',
        method: EApiMethod.GET,
        controller: searchController.searchPosts,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/',
        method: EApiMethod.GET,
        controller: searchController.search,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(searchRouter, searchRoutes);

export default searchRouter;
