const express = require('express');
const authRoutes = require('./Routes/authRoutes');
const formRoutes = require('./Routes/formRoutes');
const dataRoutes = require('./Routes/dataRoutes');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration - use only one approach
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH","PUT"],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Parse JSON and cookies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Database connection with better error handling and timeout
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MANGO_URI, {
      dbName: "LostAndFound",
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Exit process with failure if this is critical
    // process.exit(1);
  }
};

connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: "This is default route to checking ok dheerendra", success: true });
});

app.use('/api/auth/', authRoutes);
app.use('/api/forms/', formRoutes);
app.use('/api/form/', dataRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: "Something went wrong",
    success: false
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    success: false
  });
});

// Server
const server = app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`);
}).on('error', (error) => {
  console.log('Error starting server:', error);
});

// Handle server timeouts
server.timeout = 60000; // Set timeout to 60 seconds

// For Vercel, we need to export the app
module.exports = app;