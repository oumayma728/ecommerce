const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define user roles
const ROLES = {
    ADMIN: 'admin',
    SELLER: 'seller',
    CLIENT: 'client',
};
// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, role } = req.body;

        // Debug: Log the role received
        console.log('Role received:', role);

        // Validate role
        if (!Object.values(ROLES).includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role, // Ensure this is being set
        });

        await user.save();

        // Debug: Log the saved user
        console.log('User saved:', user);

        res.status(201).json({ message: 'User registered successfully', role });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Logging in user:', { email });

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Invalid email or password for email:', email);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for email:', email);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });

        console.log('Login successful for user:', { email, role: user.role });

        // Send response with token and role
        res.json({ token, role: user.role });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Fetch user details
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ ...user._doc, role: user.role }); // Include role in response
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add seller details
exports.addSellerDetails = async (req, res) => {
    try {
        const { userId, shopName, description, idProof, experienceProof } = req.body;

        console.log('Adding seller details for user ID:', userId);

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is a seller
        if (user.role !== ROLES.SELLER) {
            console.log('User is not a seller:', userId);
            return res.status(400).json({ message: 'User is not a seller' });
        }

        // Update seller information
        user.sellerInfo = {
            shopName,
            description,
            idProof, // Save ID proof (base64 or URL)
            experienceProof, // Save experience proof (base64 or URL)
        };

        await user.save();

        console.log('Seller details updated successfully for user ID:', userId);
        res.status(200).json({ message: 'Seller details updated successfully' });
    } catch (error) {
        console.error('Error updating seller details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Middleware for role-based access control
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            console.log('User not authenticated or role missing');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { role } = req.user; // Assuming user info is added to req by authentication middleware

        console.log('Authorizing user with role:', role);

        if (!roles.includes(role)) {
            console.log('Access forbidden for role:', role);
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};
