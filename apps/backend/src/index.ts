import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import candidateRoutes from './routes/candidate.routes';
import interviewRoutes from './routes/interview.routes';

import employeeRoutes from './routes/employee.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: true, // Allow any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(express.json());

// Request logging with details
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers Auth:', req.headers.authorization ? 'Present' : 'Missing');
    // console.log('Body:', JSON.stringify(req.body, null, 2)); 
    next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/employees', employeeRoutes);

import assessmentRoutes from './routes/assessment.routes';
import offerRoutes from './routes/offer.routes';
import onboardingRoutes from './routes/onboarding.routes';
import talentPoolRoutes from './routes/talentpool.routes';

app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/talent-pool', talentPoolRoutes);

import userRoutes from './routes/user.routes';
app.use('/api/v1/users', userRoutes);

// Error Handling Middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global Error:', err);
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Health Check
app.get('/', (req, res) => {
    res.send('HR CRM Backend Running');
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/HRCRM';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
