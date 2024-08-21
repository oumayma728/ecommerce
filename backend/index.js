const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Stripe = require('stripe');
const bcrypt = require('bcryptjs');
//const authRoutes = require('./routes/userRoutes'); // Adjust path if needed
/*const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const db = require('./config/database'); // Import database configuration*/
// Load environment variables
dotenv.config();
//const shopRoutes = require('./routes/shopRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
//app.use('/api/shops', shopRoutes);
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;


console.log('MongoDB URI:', MONGODB_URI);

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/ecommerce")
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

/* User schema
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    image: String,
});*/


// Product schema
const schemaProduct = mongoose.Schema({
    name: String,
    category: String,
    image: String,
    price: Number,
    description: String,
});
const UserModel=require('./models/userModel')

const productModel = mongoose.model("product", schemaProduct);

// Get users
app.get("/getUsers", async (req, res) => {
      const users = await UserModel.find(); // Fetch all users from MongoDB
      res.json(users); // Send the users back to the frontend
    
  });
  

// API routes
app.get("/profile", (req, res) => {
    res.send("Server is running");
});

// Sign up
app.post("/signup", async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).send({ message: "All fields are required", alert: false });
        }

        if (password !== confirmPassword) {
         
            return res.status(400).send({ message: "Passwords do not match", alert: false });
        }

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).send({ message: "Email is already registered", alert: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ ...req.body, password: hashedPassword });

        await newUser.save();
        res.status(201).send({ message: "Successfully signed up", alert: true });
    } catch (err) {
        console.error("Error signing up:", err);
        res.status(500).send({ message: "Error signing up", alert: false });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).send({ message: "Email is not registered", alert: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send({ message: "Incorrect password", alert: false });
        }

        const dataSend = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            image: user.image,
        };
        res.send({
            message: "Login is successful",
            alert: true,
            data: dataSend,
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send({ message: "Error logging in", alert: false });
    }
});

// Upload product
app.post("/uploadProduct", async (req, res) => {
    try {
        const newProduct = new productModel(req.body);
        await newProduct.save();
        res.status(201).send({ message: "Upload successful" });
    } catch (err) {
        console.error("Error uploading product:", err);
        res.status(500).send({ message: "Error uploading product" });
    }
});

// Get products
app.get("/product", async (req, res) => {
    try {
        const products = await productModel.find({});
        res.send(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send({ message: "Error fetching products" });
    }
});

//app.use('/api', authRoutes); // Ensure '/api' is the correct base path

// Stripe setup
const stripe = new Stripe(STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
    try {
        const params = {
            submit_type: 'pay',
            mode: "payment",
            payment_method_types: ['card'],
            billing_address_collection: "auto",
            shipping_options: [{ shipping_rate: "shr_1N0qDnSAq8kJSdzMvlVkJdua" }],
            line_items: req.body.map((item) => ({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: item.name,
                        // images: [item.image] // Uncomment if you want to include images
                    },
                    unit_amount: item.price * 100,
                },
                adjustable_quantity: {
                    enabled: true,
                    minimum: 1,
                },
                quantity: item.qty,
            })),
            success_url: `${FRONTEND_URL}/success`,
            cancel_url: `${FRONTEND_URL}/cancel`,
        };

        const session = await stripe.checkout.sessions.create(params);
        res.status(200).json({ sessionId: session.id });
    } catch (err) {
        console.error("Error creating checkout session:", err);
        res.status(err.statusCode || 500).json({ message: err.message });
    }
});

// Add this route to handle profile updates
app.post("/updateProfile", async (req, res) => {
    try {
        const { userId, name, role, job, followers, following, avatar, banner } = req.body;

        // Find the user by ID and update the profile
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { name, role, job, followers, following, avatar, banner },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).send({ message: "User not found", alert: false });
        }

        res.status(200).send({ message: "Profile updated successfully", alert: true, data: updatedUser });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).send({ message: "Error updating profile", alert: false });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


