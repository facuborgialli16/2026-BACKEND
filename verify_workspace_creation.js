
import mongoose from 'mongoose';
import workspaceController from './controllers/workspace.controller.js';
import userRepository from './repository/user.repository.js';
import workspaceRepository from './repository/workspace.repository.js';
import ENVIRONMENT from './config/environment.config.js';

// Mock request and response
const mockResponse = () => {
    const res = {};
    res.json = (data) => {
        console.log('Response JSON:', JSON.stringify(data, null, 2));
        return res;
    };
    res.status = (code) => {
        console.log('Response Status:', code);
        return res;
    };
    return res;
};

const runVerification = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(`${ENVIRONMENT.MONGO_DB_URI}/${ENVIRONMENT.MONGO_DB_NAME}`);
        console.log('Connected.');

        // 1. Create a dummy user
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'password123';
        const username = `testuser_${Date.now()}`;

        console.log(`Creating user: ${email}`);
        // We'll use the repository directly to bypass hashing for this quick test if possible,
        // or just use the auth controller logic if needed. 
        // Actually repo expects hashed password, so let's just make up a string, it doesn't matter for this test.
        const user = await userRepository.crear(email, 'hashed_password_placeholder', username);
        console.log('User created:', user._id);

        // 2. Create a workspace
        const req = {
            body: {
                title: 'Test Workspace ' + Date.now(),
                image: 'http://example.com/image.png',
                description: 'A test workspace'
            },
            user: {
                id: user._id
            }
        };

        console.log('Creating workspace with:', req.body);
        await workspaceController.create(req, mockResponse());

        console.log('Verification successful!');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runVerification();
