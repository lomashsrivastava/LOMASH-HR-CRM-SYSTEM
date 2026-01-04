import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import Organization from '../src/models/Organization';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/HRCRM';

const checkUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        for (const user of users) {
            console.log(`User: ${user.name} (${user.email})`);
            console.log(` - Org ID: ${user.organizationId}`);

            if (!user.organizationId) {
                console.log(' - WARNING: No Organization ID! Fixing...');
                let org = await Organization.findOne({});
                if (!org) {
                    console.log('   - No Organization found. Creating one...');
                    org = await Organization.create({
                        name: 'Default Org',
                        address: '123 Tech Street',
                        email: 'admin@techcorp.com',
                        phone: '555-0100'
                    });
                }
                user.organizationId = org._id;
                await user.save();
                console.log(`   - Fixed: Assigned to Org ${org.name}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();
