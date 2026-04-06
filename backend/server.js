const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const userRoutes = require('./src/routes/users');
const quranRoutes = require('./src/routes/quran');

app.use('/api/users', userRoutes);
app.use('/api/quran', quranRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Zad Salama Backend API is running' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zad-salama';

// Start HTTP server immediately so the API is always available
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB (non-blocking)
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,  // Fail fast: 5s instead of 30s
  connectTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('👉 Check your IP whitelist in MongoDB Atlas → Network Access');
  });
