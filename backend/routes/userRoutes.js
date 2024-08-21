// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Adjust the path if needed

// Middleware for JWT authentication (assuming you have a function to authenticate JWT)
const authenticateJWT = require('../middleware/roleMiddleware');

// Register user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Fetch user details (requires authentication)

// Add seller details (requires authentication and seller role)

module.exports = router;
