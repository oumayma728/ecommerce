// backend/controllers/shopController.js
const Shop = require('../models/shopModel');

exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
