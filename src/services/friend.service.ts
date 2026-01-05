import Conversation from '../models/conversation.model';
import ConversationMember from '../models/conversation-member.model';
import Friendship from '../models/friendship.model';
import { Types } from 'mongoose';

class FriendService {
    /**
     * Get friends with their private conversations
     */
    async getFriendsWithConversations(userId: string) {
        // Get all friendships
        const friendships = await Friendship.find({
            $or: [{ user1: userId }, { user2: userId }],
        })
            .populate('user1', '_id name avatar isOnline')
            .populate('user2', '_id name avatar isOnline')
            .lean();

        // Extract friends
        const friends = friendships.map((friendship) => {
            const isUser1 = friendship.user1._id.toString() === userId;
            return isUser1 ? friendship.user2 : friendship.user1;
        });

        // Get all private conversations where user is a member
        const userObjectId = new Types.ObjectId(userId);
        const conversationMembers = await ConversationMember.find({
            user: userObjectId,
        })
            .populate({
                path: 'conversation',
                match: { type: 'private' },
                populate: {
                    path: 'lastMessage',
                    select: 'content sender createdAt',
                },
            })
            .lean();

        const privateConversations = conversationMembers
            .filter((cm) => cm.conversation != null)
            .map((cm) => cm.conversation);

        // Get members for each private conversation
        const conversationIds = privateConversations.map((c: any) => c._id);
        const allMembers = await ConversationMember.find({
            conversation: { $in: conversationIds },
        })
            .populate('user', '_id name avatar isOnline')
            .lean();

        // Group members by conversation
        const membersByConversation = new Map();
        allMembers.forEach((member: any) => {
            const convId = member.conversation.toString();
            if (!membersByConversation.has(convId)) {
                membersByConversation.set(convId, []);
            }
            membersByConversation.get(convId).push(member);
        });

        // Map conversations with friend info
        const friendConversations = privateConversations
            .map((conversation: any) => {
                const members = membersByConversation.get(
                    conversation._id.toString()
                );
                const otherMember = members?.find(
                    (m: any) => m.user._id.toString() !== userId
                );
                const friend = otherMember?.user;

                // Only include if friend exists in friendships
                const isFriend = friends.some(
                    (f: any) => f._id.toString() === friend?._id.toString()
                );

                if (!isFriend) return null;

                return {
                    _id: conversation._id,
                    type: conversation.type,
                    lastMessage: conversation.lastMessage,
                    friend: friend,
                    createdAt: conversation.createdAt,
                    updatedAt: conversation.updatedAt,
                };
            })
            .filter(Boolean);

        // Get group conversations
        const groupConversationMembers = await ConversationMember.find({
            user: userObjectId,
        })
            .populate({
                path: 'conversation',
                match: { type: 'group' },
                populate: [
                    {
                        path: 'lastMessage',
                        select: 'content sender createdAt',
                    },
                    {
                        path: 'avatar',
                        select: 'url',
                    },
                    {
                        path: 'group',
                        select: 'name avatar',
                        populate: {
                            path: 'avatar',
                            select: 'url',
                        },
                    },
                ],
            })
            .lean();

        const groupConversations = groupConversationMembers
            .filter((cm) => cm.conversation != null)
            .map((cm) => cm.conversation);

        return {
            friends,
            friendConversations,
            groupConversations,
        };
    }
}

export default new FriendService();
