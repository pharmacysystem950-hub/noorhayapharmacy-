// seedAdmins.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/AdminModel'); // use existing model

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://Admin:password1234@cluster1.zmuvd1w.mongodb.net/POS_IM_PHARMACY_SYSTEM?retryWrites=true&w=majority&appName=cluster1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Default admin accounts
const defaultAdmins = [
    { USERNAME: 'Admin1', PASSWORD: 'password123()', PHARMACY_NAME: 'Pharmacy1' },
    { USERNAME: 'Admin2', PASSWORD: 'password456??', PHARMACY_NAME: 'Pharmacy2' },
    { USERNAME: 'Admin3', PASSWORD: '[password789]', PHARMACY_NAME: 'Pharmacy3' },
    { USERNAME: 'Admin4', PASSWORD: '#newpassword111#', PHARMACY_NAME: 'Pharmacy4' },
    { USERNAME: 'Admin5', PASSWORD: '*newpassword222*', PHARMACY_NAME: 'Pharmacy5' },
    { USERNAME: 'Admin6', PASSWORD: 'password456', PHARMACY_NAME: 'Pharmacy6' },
];

async function seedDefaultAdmins() {
    try {
        for (const admin of defaultAdmins) {
            const hashedPassword = await bcrypt.hash(admin.PASSWORD, 10);

            // Check if admin already exists
            const existingAdmin = await Admin.findOne({ USERNAME: admin.USERNAME });

            if (!existingAdmin) {
                await Admin.create({
                    USERNAME: admin.USERNAME,
                    PASSWORD: hashedPassword,
                    PHARMACY_NAME: admin.PHARMACY_NAME,
                });
                console.log(`Seeded account for ${admin.USERNAME}`);
            } else {
                existingAdmin.PASSWORD = hashedPassword;
                existingAdmin.PHARMACY_NAME = admin.PHARMACY_NAME;
                await existingAdmin.save();
                console.log(`Updated account for ${admin.USERNAME}`);
            }
        }
    } catch (err) {
        console.error('Error seeding default admins:', err);
    } finally {
        mongoose.connection.close();
    }
}

seedDefaultAdmins();
