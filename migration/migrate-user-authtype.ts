import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from '../src/models/user.model';

dotenv.config();

const migrateUserAuthType = async () => {
    try {
        // Connect to MongoDB
        const mongoUri =
            process.env.MONGODB_URI || 'mongodb://localhost:27017/handbook';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Update users without password to authType: 'google'
        const resultNoPassword = await User.updateMany(
            {
                password: { $exists: false },
                authType: { $ne: 'google' },
            },
            {
                $set: { authType: 'google' },
            }
        );
        console.log(
            `✅ Updated ${resultNoPassword.modifiedCount} users without password to authType: 'google'`
        );

        // Update users with password to authType: 'local'
        const resultWithPassword = await User.updateMany(
            {
                password: { $exists: true, $ne: null },
                authType: { $ne: 'local' },
            },
            {
                $set: { authType: 'local' },
            }
        );
        console.log(
            `✅ Updated ${resultWithPassword.modifiedCount} users with password to authType: 'local'`
        );

        // Verify migration results
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$authType',
                    count: { $sum: 1 },
                },
            },
        ]);
        console.log('\n📊 Migration Summary:');
        stats.forEach((stat) => {
            console.log(`   authType: ${stat._id} → ${stat.count} users`);
        });

        console.log('\n✨ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

migrateUserAuthType();
