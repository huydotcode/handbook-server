import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { EApiMethod, IApiRoute } from '../common/types/route.type';
import addRoutes from '../common/utils/add-route';

const postRouter = Router();
const postController = new PostController();

const postRoutes: IApiRoute[] = [
    {
        path: '/',
        method: EApiMethod.GET,
        controller: postController.getAllPosts,
    },
    {
        path: '/',
        method: EApiMethod.POST,
        controller: postController.createPost,
    },
    {
        path: '/new-feed',
        method: EApiMethod.GET,
        controller: postController.getNewFeedPosts,
    },
    {
        path: '/new-feed-group',
        method: EApiMethod.GET,
        controller: postController.getNewFeedGroupPosts,
    },
    {
        path: '/new-feed-friend',
        method: EApiMethod.GET,
        controller: postController.getNewFeedFriendPosts,
    },
    {
        path: '/saved',
        method: EApiMethod.GET,
        controller: postController.getSavedPosts,
    },
    {
        path: '/profile/:user_id',
        method: EApiMethod.GET,
        controller: postController.getProfilePosts,
    },
    {
        path: '/group/:group_id/member/:user_id',
        method: EApiMethod.GET,
        controller: postController.getPostByMember,
    },
    {
        path: '/group/:group_id/manage',
        method: EApiMethod.GET,
        controller: postController.getManageGroupPosts,
    },
    {
        path: '/group/:group_id/manage/pending',
        method: EApiMethod.GET,
        controller: postController.getManageGroupPostsPending,
    },
    {
        path: '/group/:group_id',
        method: EApiMethod.GET,
        controller: postController.getGroupPosts,
    },
    {
        path: '/:id',
        method: EApiMethod.GET,
        controller: postController.getPostById,
    },
];

addRoutes(postRouter, postRoutes);

export default postRouter;
