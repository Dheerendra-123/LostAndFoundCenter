const express = require('express');
const authRoutes = require('./Routes/authRoutes');
const formRoutes = require('./Routes/formRoutes');
const dataRoutes = require('./Routes/dataRoutes');
const cookieParser = require('cookie-parser');
const { default: mongoose } = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 8000;

// Load environment variables
require('dotenv').config();

// ✅ CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,  
  credentials: true,                   
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Supported HTTP methods
};

app.use(cors(corsOptions));
app.use(express.static('public'));


app.options("*", cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { dbName: "LostAndFound" })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.get('/', (req, res) => {
  res.json({ message: "This is default route to checking ok dheerendra", success: true });
});

// API routes
app.use('/api/auth/', authRoutes);
app.use('/api/forms/', formRoutes);
app.use('/api/form/', dataRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`);
}).on('error', (error) => {
  console.log('Error starting server:', error);
});
