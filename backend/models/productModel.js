const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
    },
    image: String,
});

const Product = mongoose.model('products', productSchema);

module.exports = Product;
