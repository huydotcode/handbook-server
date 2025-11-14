import app from './app';
import { config } from './common/utils/config';
import { connectToMongo } from './common/utils/mongodb';

const startServer = async () => {
    // First, connect to the database
    await connectToMongo();

    // Then, start the express server
    app.listen(config.port, () => {
        console.log(`Server is running on port: ${config.port}`);
    });
};

startServer();
