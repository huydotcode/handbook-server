import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env configuration
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateImagesToMedia = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Access the raw collection to avoid Schema validation errors (since 'images' field is removed from Schema)
        const messagesCollection = mongoose.connection.collection('messages');

        console.log('🔄 Starting migration: images -> media...');

        // Update all documents: unset 'images' and set 'media' to []
        const result = await messagesCollection.updateMany(
            {}, // Filter: apply to all documents
            {
                $unset: { images: 1 }, // Remove legacy field
                $set: { media: [] }, // Initialize new field
            }
        );

        console.log(`✨ Migration completed:`);
        console.log(`   - Matched: ${result.matchedCount}`);
        console.log(`   - Modified: ${result.modifiedCount}`);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
};

migrateImagesToMedia();
