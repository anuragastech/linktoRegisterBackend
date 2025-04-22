const express = require('express');
const multer = require('multer');
const cors = require('cors');
const connectDB = require('./confic/db');
const mongoose = require('mongoose');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

// Connect to MongoDB
connectDB();


// Define Schema for Registration
const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  house: { type: String, required: true },
  age: { type: Number, required: true },
  studentClass: { type: String, required: true },
  father: { type: String, required: true },
  phone: { type: String, required: true },
  photo: { type: String, required: false }
});

const Registration = mongoose.model('Registration', registrationSchema);

// Set up Express
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Setup Multer for photo uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage: storage });

// POST /register
app.post('/register', upload.single('photo'), async (req, res) => {
    const { name, house, age, studentClass, father, phone } = req.body;
  
    const photoFilename = req.file ? req.file.filename : ''; // Works with or without file
  
    try {
      const newRegistration = new Registration({
        name,
        house,
        age,
        studentClass,
        father,
        phone,
        photo: photoFilename, // Save empty string if no photo
      });
  
      await newRegistration.save();
      console.log('✅ Registration saved to MongoDB:', newRegistration);
      res.json({ success: true, message: 'Registration saved successfully' });
  
    } catch (error) {
      console.error('❌ Error saving to MongoDB:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
// GET /registrations
app.get('/registrations', async (req, res) => {
  try {
    // Fetch all registrations from MongoDB
    const registrations = await Registration.find();
    res.json(registrations);
  } catch (error) {
    console.error('❌ Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Could not fetch registrations' });
  }
});

// Start server
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
