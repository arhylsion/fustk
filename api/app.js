const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); 
const mongoose = require('mongoose'); 
require('dotenv').config({ path: './.env' }); // Muat variabel lingkungan dari .env

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();

// --- KONEKSI DATABASE MONGODB dengan Logika Retry ---
const DB_URI = process.env.MONGO_URI;
const connectWithRetry = () => {
  console.log('Menghubungkan ke MongoDB...');
  mongoose.connect(DB_URI)
    .then(() => {
      console.log('MongoDB connection successful!');
    })
    .catch((err) => {
      // Menunggu 5 detik sebelum mencoba lagi
      console.error('MongoDB connection error. Retrying in 5 seconds...', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();
// ---------------------------------------------------

// Konfigurasi CORS
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares Dasar
app.use(logger('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- MOUNT ROUTERS ---
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter) 

// Error Handler Sederhana
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke on the API side!');
});

module.exports = app;
