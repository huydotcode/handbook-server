import { Router } from 'express';
import userAdminRouter from './users.route';
import groupAdminRouter from './groups.route';

const adminRouter = Router();

adminRouter.use('/users', userAdminRouter);
adminRouter.use('/groups', groupAdminRouter);

export default adminRouter;
