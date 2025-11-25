import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const postRouter = Router();
const postController = new PostController();

const postRoutes: IApiRoute[] = [
    // Specific routes first
    {
        path: '/:id/save',
        method: EApiMethod.DELETE,
        controller: postController.unsavePost,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/save',
        method: EApiMethod.POST,
        controller: postController.savePost,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/share',
        method: EApiMethod.POST,
        controller: postController.sharePost,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/:id/like',
        method: EApiMethod.POST,
        controller: postController.likePost,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/new-feed',
        method: EApiMethod.GET,
        controller: postController.getNewFeedPosts,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/new-feed-group',
        method: EApiMethod.GET,
        controller: postController.getNewFeedGroupPosts,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/new-feed-friend',
        method: EApiMethod.GET,
        controller: postController.getNewFeedFriendPosts,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/saved',
        method: EApiMethod.GET,
        controller: postController.getSavedPosts,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/profile/:userId',
        method: EApiMethod.GET,
        controller: postController.getProfilePosts,
        isRateLimited: true,
    },
    {
        path: '/group/:groupId/manage/pending',
        method: EApiMethod.GET,
        controller: postController.getManageGroupPostsPending,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/group/:groupId/manage',
        method: EApiMethod.GET,
        controller: postController.getManageGroupPosts,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    {
        path: '/group/:groupId/member/:userId',
        method: EApiMethod.GET,
        controller: postController.getPostByMember,
        isRateLimited: true,
    },
    {
        path: '/group/:groupId',
        method: EApiMethod.GET,
        controller: postController.getGroupPosts,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Collection routes
    {
        path: '/',
        method: EApiMethod.GET,
        controller: postController.getAllPosts,
        isRateLimited: true,
    },
    {
        path: '/',
        method: EApiMethod.POST,
        controller: postController.createPost,
        isPrivateRoute: true,
        isRateLimited: true,
    },
    // Dynamic routes last
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: postController.getPostById,
        isRateLimited: true,
    },
];

addRoutes(postRouter, postRoutes);

export default postRouter;
