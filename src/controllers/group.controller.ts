import { NextFunction, Request, Response } from 'express';
import Group from '../models/group.model';
import { POPULATE_USER } from '../utils/populate';

class GroupController {
    public async getGroupByGroupId(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id: groupId } = req.params;

            const group = await Group.findById(groupId)
                .populate('avatar')
                .populate('creator', POPULATE_USER)
                .populate('members.user', POPULATE_USER);

            if (!group) {
                res.status(404).json({ message: 'Group not found' });
            }

            res.status(200).json(group);
        } catch (error) {
            next(error);
        }
    }

    public async getJoinedGroups(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.query.user_id;

            const groups = await Group.find({
                members: {
                    $elemMatch: { user: userId },
                },
            })
                .populate('avatar')
                .populate('creator', POPULATE_USER)
                .populate('members.user', POPULATE_USER);

            res.status(200).json(groups);
        } catch (error) {
            next(error);
        }
    }
}

export default new GroupController();
