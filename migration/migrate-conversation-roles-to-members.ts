// import mongoose, { Types } from 'mongoose';
// // import ConversationRole from '../src/models/conversation-role.model';
// import ConversationMember from '../src/models/conversation-member.model';
// import {
//     connectToMongo,
//     disconnectFromMongo,
// } from '../src/common/utils/mongodb';
// import { validateConfig } from '../src/common/utils/config';

// async function run() {
//     validateConfig();
//     await connectToMongo();

//     // const roles = await ConversationRole.find({}).lean();
//     console.log(`Found ${roles.length} conversation role records`);

//     let created = 0;
//     for (const roleDoc of roles) {
//         const conversationId = roleDoc.conversationId.toString();
//         const role = roleDoc.role as 'admin' | 'member';
//         const userIds: any[] = Array.isArray(roleDoc.userIds)
//             ? roleDoc.userIds
//             : [];

//         for (const userIdRaw of userIds) {
//             if (!userIdRaw) continue;
//             const userId = userIdRaw.toString();

//             await ConversationMember.updateOne(
//                 { conversation: conversationId, user: userId },
//                 {
//                     $setOnInsert: {
//                         conversation: new Types.ObjectId(conversationId),
//                         user: new Types.ObjectId(userId),
//                         role,
//                     },
//                 },
//                 { upsert: true }
//             );
//             created++;
//         }
//     }

//     console.log(`Upserted ${created} conversation members`);
//     await disconnectFromMongo();
// }

// run()
//     .then(() => {
//         console.log('Migration completed successfully');
//         process.exit(0);
//     })
//     .catch((err) => {
//         console.error('Migration failed:', err);
//         mongoose.disconnect();
//         process.exit(1);
//     });
