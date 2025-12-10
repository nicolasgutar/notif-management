import { Router } from 'express';
import { createNotification, getNotifications, sendMatchingNotifications, getLatestEmail } from '../controllers/notification.controller';

const router = Router();

router.post('/create-notification', createNotification);
router.get('/get-notifications', getNotifications);
router.post('/send-matching-notifications', sendMatchingNotifications);
router.get('/email-mock/latest', getLatestEmail);

// Template Routes
import { getNotificationTemplates, updateNotificationTemplate } from '../controllers/notification.controller';
router.get('/notification-templates', getNotificationTemplates);
router.put('/notification-templates/:id', updateNotificationTemplate);

export default router;
