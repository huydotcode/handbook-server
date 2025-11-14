import { Router } from 'express';
import authRouter from './auth.route';
import categoryRouter from './category.route';
import commentRouter from './comment.route';
import conversationRouter from './conversation.route';
import followRouter from './follow.route';
import groupRouter from './group.route';
import itemRouter from './item.route';
import locationRouter from './location.route';
import messageRouter from './message.route';
import notificationRouter from './notification.route';
import postRouter from './post.route';
import searchRouter from './search.route';
import uploadRouter from './upload.route';
import userRouter from './user.route';

const apiRouter = Router();

// Public routes first
apiRouter.use('/auth', authRouter);

// Protected routes
apiRouter.use('/posts', postRouter);
apiRouter.use('/comments', commentRouter);
apiRouter.use('/conversations', conversationRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/items', itemRouter);
apiRouter.use('/messages', messageRouter);
apiRouter.use('/follows', followRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/locations', locationRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/groups', groupRouter);
apiRouter.use('/uploads', uploadRouter);
apiRouter.use('/categories', categoryRouter);

export default apiRouter;
