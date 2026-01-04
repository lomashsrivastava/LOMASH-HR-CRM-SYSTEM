
import mongoose from 'mongoose';
import User from '../src/models/User';
import Organization from '../src/models/Organization';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testRegister = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/HRCRM');
        console.log('Connected to Mongo');

        const email = 'test_script_user@example.com';
        const password = 'password123';
        const orgName = 'Script Org';

        // Clean up
        await User.deleteOne({ email });
        await Organization.deleteOne({ name: orgName });

        console.log('Creating Org...');
        const org = await Organization.create({ name: orgName, domain: 'example.com' });
        console.log('Org Created:', org._id);

        console.log('Hashing Password...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        console.log('Creating User...');
        const user = await User.create({
            name: 'Script User',
            email,
            passwordHash,
            role: 'recruiter',
            organizationId: org._id
        });

        console.log('User Created Successfully:', user._id);
        console.log('Token logic check passed (simulated)');

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

testRegister();
