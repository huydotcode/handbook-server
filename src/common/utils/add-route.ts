import { Router, RequestHandler } from 'express';
import { EApiMethod, IApiRoute } from '../types/route.type';
import authMiddleware from '../../middlewares/auth.middleware';
import limiteMiddleware from '../../middlewares/limite.middleware';
import adminMiddleware from '../../middlewares/admin.middleware';

const methodMap: Record<EApiMethod, keyof Router> = {
    [EApiMethod.GET]: 'get',
    [EApiMethod.POST]: 'post',
    [EApiMethod.PUT]: 'put',
    [EApiMethod.DELETE]: 'delete',
};

export function addRoute(router: Router, route: IApiRoute): Router {
    const method = methodMap[route.method];
    if (!method || typeof (router as any)[method] !== 'function') {
        throw new Error(`INVALID_METHOD: ${route.method}`);
    }

    const middlewares: RequestHandler[] = [];

    if (route.isRateLimited) {
        middlewares.push(limiteMiddleware);
    }

    if (route.isPrivateRoute) {
        middlewares.push(authMiddleware);
    }

    if (route.isAdminRoute) {
        middlewares.push(adminMiddleware);
    }

    if (route.middlewares) {
        if (Array.isArray(route.middlewares)) {
            middlewares.push(...route.middlewares);
        } else {
            middlewares.push(route.middlewares);
        }
    }

    (router as any)[method](
        route.path,
        ...middlewares,
        route.controller as unknown as RequestHandler
    );
    return router;
}

export default function addRoutes(
    router: Router,
    routes: IApiRoute[] | IApiRoute
): Router {
    if (Array.isArray(routes)) {
        routes.forEach((r) => addRoute(router, r));
        return router;
    }
    return addRoute(router, routes);
}
