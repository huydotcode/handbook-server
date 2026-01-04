import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const categoryRouter = Router();
const categoryController = new CategoryController();

const categoryRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/all',
        method: EApiMethod.GET,
        controller: categoryController.getAllCategories,
        isRateLimited: true,
        isPrivateRoute: true,
    },
    {
        path: '/search',
        method: EApiMethod.GET,
        controller: categoryController.searchCategories,
        isRateLimited: true,
        isPrivateRoute: true,
    },
    {
        path: '/slug/:slug',
        method: EApiMethod.GET,
        controller: categoryController.getCategoryBySlug,
        isRateLimited: true,
        isPrivateRoute: true,
    },
    // Collection routes
    {
        path: '/',
        method: EApiMethod.GET,
        controller: categoryController.getCategories,
        isRateLimited: true,
        isPrivateRoute: true,
    },
    {
        path: '/',
        method: EApiMethod.POST,
        controller: categoryController.createCategory,
        isRateLimited: true,
        isPrivateRoute: true,
        isAdminRoute: true,
    },
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: categoryController.getCategoryById,
        isRateLimited: true,
        isPrivateRoute: true,
    },
    {
        path: '/:id',
        method: EApiMethod.PUT,
        controller: categoryController.updateCategory,
        isRateLimited: true,
        isPrivateRoute: true,
        isAdminRoute: true,
    },
    {
        path: '/:id',
        method: EApiMethod.DELETE,
        controller: categoryController.deleteCategory,
        isRateLimited: true,
        isPrivateRoute: true,
        isAdminRoute: true,
    },
];

addRoutes(categoryRouter, categoryRoutes);

export default categoryRouter;
