import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.ts';
import { generalLimiter } from './middleware/rateLimiter.ts';

import patientRoutes from './routes/patientRoutes.ts';
import prescriptionRoutes from './routes/prescriptionRoutes.ts';
import medicationRoutes from './routes/medicationRoutes.ts';
import walletRoutes from './routes/walletRoutes.ts';
import appointmentRoutes from './routes/appointmentRoutes.ts';

import sequelize from './database/config.ts';
import './models/associations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pharmacy Prescription System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Pharmacy Prescription System API',
    version: '1.0.0',
    endpoints: {
      patients: '/api/patients',
      prescriptions: '/api/prescriptions',
      medications: '/api/medications',
      wallets: '/api/wallets',
      appointments: '/api/appointments'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

app.use(notFoundHandler);

app.use(errorHandler);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized.');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API Documentation: http://localhost:${PORT}/api`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}


startServer();

export default app;