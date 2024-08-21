// backend/routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/shops', shopController.getAllShops);

module.exports = router;
