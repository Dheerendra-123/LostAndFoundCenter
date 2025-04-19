const express = require('express');
const authRoutes=require('./Routes/authRoutes');
const formRoutes=require('./Routes/formRoutes');
const dataRoutes=require('./Routes/dataRoutes')
const cookieParser = require('cookie-parser');
const { default: mongoose } = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true   ,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]            // allow cookies
  }));

  app.use(cors(corsOptions));

  // ✅ Handle preflight OPTIONS requests
  app.options("*", cors(corsOptions));  
app.use(express.json());
require('dotenv').config();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MANGO_URI,{dbName:"LostAndFound"}).then(()=>{
    console.log("MongoDB Connected");
}).catch((error)=>{
console.log(error);

});
app.get('/', (req, res) => {
    res.json({ message: "This is default route to checking ok dheerendra", success: true });
});

app.use('/api/auth/',authRoutes);
app.use('/api/forms/',formRoutes);
app.use('/api/form/',dataRoutes);


app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
}).on('error', (error) => {
    console.log('Error starting server:', error);
});
