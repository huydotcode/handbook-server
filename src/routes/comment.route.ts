import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const commentRouter = Router();
const commentController = new CommentController();

const commentRoutes: IApiRoute[] = [
    {
        path: '/post/:postId',
        method: EApiMethod.GET,
        controller: commentController.getCommentsByPost,
        isRateLimited: true,
    },
    {
        path: '/reply/:commentId',
        method: EApiMethod.GET,
        controller: commentController.getReplyComments,
        isRateLimited: true,
    },
    {
        path: '/post/:postId/count',
        method: EApiMethod.GET,
        controller: commentController.countCommentsByPost,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: commentController.getCommentById,
        isRateLimited: true,
    },
    {
        path: '/',
        method: EApiMethod.POST,
        controller: commentController.createComment,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.PUT,
        controller: commentController.updateComment,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id',
        method: EApiMethod.DELETE,
        controller: commentController.deleteComment,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/love',
        method: EApiMethod.POST,
        controller: commentController.addLove,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/love',
        method: EApiMethod.DELETE,
        controller: commentController.removeLove,
        isPrivateRoute: true,
        isRateLimited: true,
    },
];

addRoutes(commentRouter, commentRoutes);

export default commentRouter;
