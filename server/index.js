import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api', paymentRoutes); // covers payments and standing orders
app.use('/api/uploads', uploadRoutes);
app.use('/api/transactions', transactionRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/audit', auditRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Basic route
app.get('/', (req, res) => {
  res.send('Online Banking API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
