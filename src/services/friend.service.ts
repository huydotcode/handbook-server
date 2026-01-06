import { FriendshipRepository } from '../repositories/friendship.repository';
import { ConversationMemberRepository } from '../repositories/conversation-member.repository';

export class FriendService {
    private friendshipRepository: FriendshipRepository;
    private conversationMemberRepository: ConversationMemberRepository;

    constructor() {
        this.friendshipRepository = new FriendshipRepository();
        this.conversationMemberRepository = new ConversationMemberRepository();
    }

    /**
     * Get friends with their private conversations
     */
    async getFriendsWithConversations(userId: string) {
        // Get all friendships
        const friendships = await this.friendshipRepository.findFriendsOfUser(
            userId
        );

        // Extract friends
        const friends = friendships.map((friendship) => {
            const isUser1 = friendship.user1._id.toString() === userId;
            return isUser1 ? friendship.user2 : friendship.user1;
        });

        // Get all private conversations where user is a member
        const conversationMembers =
            await this.conversationMemberRepository.findPrivateConversationsByUser(
                userId
            );

        const privateConversations = conversationMembers
            .filter((cm) => cm.conversation != null)
            .map((cm) => cm.conversation);

        // Get members for each private conversation
        const conversationIds = privateConversations.map((c: any) => c._id);
        const allMembers =
            await this.conversationMemberRepository.findMembersByConversationIds(
                conversationIds
            );

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
        const groupConversationMembers =
            await this.conversationMemberRepository.findGroupConversationsByUser(
                userId
            );

        const groupConversations = groupConversationMembers
            .filter((cm) => cm.conversation != null)
            .map((cm) => cm.conversation);

        return {
            friends,
            friendConversations,
            groupConversations,
        };
    }

    /**
     * Get list of online friends
     */
    async getOnlineFriends(userId: string) {
        // Get all friendships
        const friendships = await this.friendshipRepository.findFriendsOfUser(
            userId
        );

        // Extract friends
        const friends = friendships.map((friendship) => {
            const isUser1 = friendship.user1._id.toString() === userId;
            return isUser1 ? friendship.user2 : friendship.user1;
        });

        // Filter online friends
        return friends.filter((friend: any) => friend.isOnline);
    }
}

export default new FriendService();
