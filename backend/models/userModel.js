const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    confirmPassword: String,
    image: String,
    role: {
        type: String,
        enum: ['admin', 'superadmin', 'seller', 'client'],
        default: 'client',
    },
    sellerInfo: {
        shopName: {
            type: String,
        },
        description: {
            type: String,
        },
        idProof: {
            type: String, // Base64 or URL
        },
        experienceProof: {
            type: String, // Base64 or URL
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
});

const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;
