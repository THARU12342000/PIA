import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import partyInteractionRoutes from './routes/partyInteraction.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route to avoid 404 at /
app.get('/', (req, res) => {
  res.send('Welcome to Party Interaction API');
});

// Routes
app.use('/api/partyInteraction', partyInteractionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Party Interaction API is running' });
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err.message);
  process.exit(1);
});
