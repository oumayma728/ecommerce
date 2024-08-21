const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
