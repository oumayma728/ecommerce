const express = require('express');
const authorizeRoles = require('../middleware/roleMiddleware');
const router = express.Router();

// Example protected route
router.get('/admin-data', authorizeRoles('admin', 'superadmin'), (req, res) => {
    res.send({ message: "This is admin data" });
});

router.get('/superadmin-data', authorizeRoles('superadmin'), (req, res) => {
    res.send({ message: "This is superadmin data" });
});

module.exports = router;
