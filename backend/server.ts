import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './database/client';
import notificationRoutes from './routes/notification.routes';

import { triggerNotification } from './controllers/notification.controller';
import scheduleRoutes from './routes/schedule.routes';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'x-api-token'],
}));

app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

app.use(authMiddleware);
app.post('/api/notifications/trigger', triggerNotification);

app.use('/api', notificationRoutes);
app.use('/api/schedules', scheduleRoutes);


const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to database');

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = async () => {
            console.log('Shutting down...');
            await prisma.$disconnect();
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
