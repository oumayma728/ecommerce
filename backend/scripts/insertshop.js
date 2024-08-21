const mongoose = require('mongoose');
const Shop = require('../models/shopModel'); // Adjust the path according to your structure

mongoose.set('strictQuery', false); // Add this line to suppress the warning

mongoose.connect('mongodb://localhost:27017/your-database', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const insertShop = async () => {
  try {
    const shop = new Shop({
      name: 'Sample Shop',
      image: 'https://via.placeholder.com/150',
      description: 'Sample Description',
      location: 'Sample Location',
      status: 'Active'
    });

    await shop.save();
    console.log('Shop inserted successfully');
  } catch (error) {
    console.error('Error inserting shop:', error);
  } finally {
    mongoose.connection.close();
  }
};

insertShop();
