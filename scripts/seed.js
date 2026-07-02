import mongoose from 'mongoose';
import connectDB from '../lib/db.js';
import User from '../models/User.model.js';
import Company from '../models/Company.model.js';
import Job from '../models/Job.model.js';
import Application from '../models/Application.model.js';
import Newsletter from '../models/Newsletter.model.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function cleanDatabase() {
  try {
    console.log('Connecting to MongoDB database for cleanup...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Cleaning up all collections...');

    // Clean up all collections
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Newsletter.deleteMany({});

    console.log('===================================================');
    console.log('DATABASE CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('All dummy, mock, and seed data has been removed.');
    console.log('===================================================');

    process.exit(0);

  } catch (error) {
    console.error('Database cleanup failed with error:', error);
    process.exit(1);
  }
}

cleanDatabase();
