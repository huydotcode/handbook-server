import app from './app';
import { connectToMongo } from './services/mongodb';
import { config } from './utils/config';

const startServer = async () => {
    // First, connect to the database
    await connectToMongo();

    // Then, start the express server
    app.listen(config.port, () => {
        console.log(`Server is running on port: ${config.port}`);
    });
};

startServer();
