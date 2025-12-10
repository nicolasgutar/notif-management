import { Request, Response } from 'express';
import prisma from '../database/client';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Import queries
import { query as queryDailyActionItems } from '../notifications/digest_daily_action_items/query';
import { query as queryWeeklySummary } from '../notifications/digest_weekly_summary/query';
import { query as queryMissingNotes } from '../notifications/notes_needed_general/query';
import { query as queryMealAttendees } from '../notifications/notes_needed_meal_attendees/query';
import { query as queryMarketplaceReceipts } from '../notifications/receipt_needed_marketplace/query';
import { query as querySpecialCategoryReceipts } from '../notifications/receipt_needed_special_category/query';

// Import Email Service
import { emailService } from '../services/email/email.service';
import { EmailTemplate } from '../services/email/EmailTemplate';
import { EmailConfig, EmailRequest } from '../services/email/types';
import { sendPushNotification } from '../services/apn.service';

const DEFAULT_EMAIL_CONFIG: EmailConfig = {
    theme: {
        primary: "#11083a",
        secondary: "#9b81f9",
        background: "#f3ecff",
        text: "#6b7280"
    },
    images: {
        logo: "https://storage.googleapis.com/investrio-images/assets/small-full-logo-cropped.png",
        headerImage: "",
        footerImage: "",
        profileImage: ""
    },
    company: {
        name: "Investrio",
        signature: {
            name: "Investrio Team",
            title: "Support",
            email: "support@investrio.io"
        }
    }
};

export const createNotification = async (req: Request, res: Response) => {
    const { type } = req.body;
    let { channel } = req.body;

    // Sanitize channel to match Enum
    if (channel) {
        channel = (channel as string).toUpperCase();
    }

    if (!type) {
        return res.status(400).json({ error: 'Notification type is required' });
    }

    try {
        const notificationsData = await generateNotificationsInternal(type, channel);
        res.json({ message: `Generated ${notificationsData.length} notifications for type ${type}` });
    } catch (error) {
        console.error('Error generating notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper for template interpolation
const interpolate = (template: string, variables: Record<string, any>) => {
    return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] || `{${key}}`);
};

// Internal function to generate notifications (reusable)
const generateNotificationsInternal = async (type: string, channel: NotificationChannel | undefined) => {
    let notificationsData: { userId: string, title: string, message: string, metadata: any, deviceToken?: string | null, status?: NotificationStatus }[] = [];

    // Fetch Template
    // @ts-ignore - Prisma client model might not be generated yet
    const templateRecord = await prisma.notificationTemplate.findUnique({
        where: { id: type }
    });

    if (!templateRecord) {
        console.warn(`No template found for type ${type}, using defaults.`);
        // Fallback to defaults or simple message if template missing
    }

    const templateString = templateRecord?.template || "Notification: {type} count: {count}";
    const templateName = templateRecord?.name || type;

    switch (type) {
        case 'digest_daily_action_items': {
            const userStats = await queryDailyActionItems();
            for (const [userId, stats] of Object.entries(userStats)) {
                // Fetch user name for interpolation - ideally we batch this or include in query
                // For simplicity, query returns user stats. We need user name.
                // Queries return userId. Let's fetch user details.
                const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, email: true } });
                const userName = user?.firstName || user?.email || 'User';

                const totalActionItems = stats.missingReceipts + stats.missingNotes + stats.missingAttendees;
                if (totalActionItems > 0) {
                    const message = interpolate(templateString, {
                        userName,
                        totalActionItems,
                        ...stats
                    });

                    notificationsData.push({
                        userId,
                        title: templateName,
                        message,
                        metadata: stats,
                        deviceToken: stats.deviceToken
                    });
                }
            }
            break;
        }
        case 'digest_weekly_summary': {
            const userStats = await queryWeeklySummary();
            for (const [userId, stats] of Object.entries(userStats)) {
                const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, email: true } });
                const userName = user?.firstName || user?.email || 'User';

                if (stats.totalWeeklyTransactions > 0) {
                    const message = interpolate(templateString, {
                        userName,
                        ...stats
                    });

                    notificationsData.push({
                        userId,
                        title: templateName,
                        message,
                        metadata: stats,
                        deviceToken: stats.deviceToken
                    });
                }
            }
            break;
        }
        case 'notes_needed_general': {
            const userTransactions = await queryMissingNotes();
            for (const [userId, transactions] of Object.entries(userTransactions)) {
                if (transactions.length > 0) {
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, email: true } });
                    const userName = user?.firstName || user?.email || 'User';

                    const message = interpolate(templateString, {
                        userName,
                        count: transactions.length
                    });

                    notificationsData.push({
                        userId,
                        title: templateName,
                        message,
                        metadata: { count: transactions.length, transactionIds: transactions.map(t => t.id) },
                        deviceToken: transactions[0]?.deviceToken
                    });
                }
            }
            break;
        }
        case 'notes_needed_meal_attendees': {
            const userTransactions = await queryMealAttendees();
            for (const [userId, transactions] of Object.entries(userTransactions)) {
                if (transactions.length > 0) {
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, email: true } });
                    const userName = user?.firstName || user?.email || 'User';

                    const message = interpolate(templateString, {
                        userName,
                        count: transactions.length
                    });

                    notificationsData.push({
                        userId,
                        title: templateName,
                        message,
                        metadata: { count: transactions.length, transactionIds: transactions.map(t => t.id) },
                        deviceToken: transactions[0]?.deviceToken
                    });
                }
            }
            break;
        }
        case 'receipt_needed_marketplace': {
            const userTransactions = await queryMarketplaceReceipts();
            for (const [userId, transactions] of Object.entries(userTransactions)) {
                if (transactions.length > 0) {
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, email: true } });
                    const userName = user?.firstName || user?.email || 'User';

                    const message = interpolate(templateString, {
                        userName,
                        count: transactions.length
                    });

                    notificationsData.push({
                        userId,
                        title: templateName,
                        message,
                        metadata: { count: transactions.length, transactionIds: transactions.map(t => t.id) },
                        deviceToken: transactions[0]?.deviceToken
                    });
                }
            }
            break;
        }
        case 'receipt_needed_special_category': {
            const userTransactions = await querySpecialCategoryReceipts();
            for (const [userId, transactions] of Object.entries(userTransactions)) {
                if (transactions.length > 0) {
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, email: true } });
                    const userName = user?.firstName || user?.email || 'User';

                    const message = interpolate(templateString, {
                        userName,
                        count: transactions.length
                    });

                    notificationsData.push({
                        userId,
                        title: templateName,
                        message,
                        metadata: { count: transactions.length, transactionIds: transactions.map(t => t.id) },
                        deviceToken: transactions[0]?.deviceToken
                    });
                }
            }
            break;
        }
        default:
            throw new Error('Invalid notification type');
    }

    if (notificationsData.length > 0) {
        // Use template default channels if specific channel not requested
        const targetChannel = channel || (templateRecord?.channels && templateRecord.channels[0] as NotificationChannel) || NotificationChannel.IN_APP;

        const defaultStatus = (targetChannel === NotificationChannel.IN_APP)
            ? NotificationStatus.PUBLISHED
            : NotificationStatus.CREATED;

        await prisma.notification.createMany({
            data: notificationsData.map(n => ({
                userId: n.userId,
                notificationType: type,
                channel: targetChannel,
                status: n.status || defaultStatus,
                title: n.title,
                message: n.message,
                metadata: n.metadata,
                sentAt: n.status === NotificationStatus.SENT ? new Date() : null
            }))
        });

        return notificationsData;
    }

    return [];
};

// Template CRUD
export const getNotificationTemplates = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const templates = await prisma.notificationTemplate.findMany();
        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateNotificationTemplate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { template, channels, name } = req.body;
    try {
        // @ts-ignore
        const updated = await prisma.notificationTemplate.update({
            where: { id },
            data: { template, channels, name }
        });
        res.json(updated);
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getNotifications = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { status, type, channel, userId, message } = req.query;

        const where: any = {};

        if (status) where.status = status as NotificationStatus;
        if (type) where.notificationType = type as string;
        if (channel) where.channel = channel as NotificationChannel;
        if (userId) where.userId = userId as string;
        if (message) where.message = { contains: message as string, mode: 'insensitive' };

        const [notifications, total] = await prisma.$transaction([
            prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true, firstName: true, lastName: true } } }
            }),
            prisma.notification.count({ where })
        ]);

        res.json({
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const sendMatchingNotifications = async (req: Request, res: Response) => {
    try {
        const { status, type, userId, message, notificationIds } = req.body;
        let { channel } = req.body;

        if (channel) {
            channel = (channel as string).toUpperCase();
        }
        const result = await sendNotificationsInternal({ status, type, channel, userId, message, notificationIds });
        res.json({ message: `Processed notifications`, stats: result });
    } catch (error) {
        console.error('Error processing notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

interface SendNotificationFilters {
    status?: NotificationStatus;
    type?: string;
    channel?: NotificationChannel;
    userId?: string;
    message?: any;
    notificationIds?: string[];
}

const sendNotificationsInternal = async (filters: SendNotificationFilters) => {
    const { status, type, channel, userId, message, notificationIds } = filters;

    const where: any = {};

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
        where.id = { in: notificationIds };
    } else {
        if (status) where.status = status;
        if (type) where.notificationType = type;
        if (channel) where.channel = channel;
        if (userId) where.userId = userId;
        if (message) where.message = { contains: message as string, mode: 'insensitive' };
    }

    // Fetch notifications to process
    const notificationsToProcess = await prisma.notification.findMany({
        where,
        include: { user: true }
    });

    let publishedCount = 0;
    let sentCount = 0;
    let failedCount = 0;

    for (const notification of notificationsToProcess) {
        if (notification.channel === NotificationChannel.IN_APP) {
            // Update to PUBLISHED
            await prisma.notification.update({
                where: { id: notification.id },
                data: { status: NotificationStatus.PUBLISHED }
            });
            publishedCount++;
        } else if (notification.channel === NotificationChannel.EMAIL) {
            // Send Email using Mock Service
            try {
                const emailTemplate = new EmailTemplate(DEFAULT_EMAIL_CONFIG);
                const emailRequest: EmailRequest = {
                    to: notification.user.email,
                    templateName: 'welcomeTemplate', // Using welcome template as generic wrapper
                    name: notification.user.firstName || 'User',
                    messageBody: notification.message,
                    urlLink: 'https://investrio.io',
                };

                const { html, subject, text } = await emailTemplate.generate(emailRequest);

                const result = await emailService.sendEmail({
                    to: notification.user.email,
                    subject: notification.title || subject,
                    html,
                    text
                });

                if (result.success) {
                    await prisma.notification.update({
                        where: { id: notification.id },
                        data: { status: NotificationStatus.SENT, sentAt: new Date() }
                    });
                    sentCount++;
                } else {
                    await prisma.notification.update({
                        where: { id: notification.id },
                        data: { status: NotificationStatus.FAILED }
                    });
                    failedCount++;
                }
            } catch (err) {
                console.error('Failed to send email:', err);
                await prisma.notification.update({
                    where: { id: notification.id },
                    data: { status: NotificationStatus.FAILED }
                });
                failedCount++;
            }
        } else if (notification.channel === NotificationChannel.APN) {
            // Send APN
            try {
                const deviceToken = notification.user.deviceToken;

                if (deviceToken) {
                    const sent = await sendPushNotification(deviceToken, notification.message, { type: notification.notificationType, ...notification.metadata as object });
                    if (sent) {
                        await prisma.notification.update({
                            where: { id: notification.id },
                            data: { status: NotificationStatus.SENT, sentAt: new Date() }
                        });
                        sentCount++;
                    } else {
                        await prisma.notification.update({
                            where: { id: notification.id },
                            data: { status: NotificationStatus.FAILED }
                        });
                        failedCount++;
                    }
                } else {
                    console.warn(`No device token for user ${notification.userId}`);
                    await prisma.notification.update({
                        where: { id: notification.id },
                        data: { status: NotificationStatus.FAILED }
                    });
                    failedCount++;
                }
            } catch (err) {
                console.error('Failed to send APN:', err);
                await prisma.notification.update({
                    where: { id: notification.id },
                    data: { status: NotificationStatus.FAILED }
                });
                failedCount++;
            }
        }
    }

    return {
        published: publishedCount,
        sent: sentCount,
        failed: failedCount,
        total: notificationsToProcess.length
    };
};

export const triggerNotification = async (req: Request, res: Response) => {
    const { type } = req.body;
    let { channel } = req.body;

    if (channel) {
        channel = (channel as string).toUpperCase();
    }

    console.log(`[Trigger] Received Trigger for ${type} via ${channel}`);

    if (!type) {
        return res.status(400).json({ error: 'Notification type is required' });
    }

    try {
        // 1. Generate Notifications
        // We capture the time before generation to verify which ones we created
        const startTime = new Date();

        await generateNotificationsInternal(type, channel);

        // 2. Query the notifications that were just created
        // This is a bit of a heuristic but works for now. 
        // We look for notifications of this type, created after startTime, with channel.
        // Or simpler: We just "send all CREATED notifications of this type and channel".
        // This avoids race conditions better than time-based if we assume this job is the worker.

        const filters: SendNotificationFilters = {
            status: NotificationStatus.CREATED,
            type,
            channel: channel.toUpperCase() as NotificationChannel
        };

        // 3. Send them
        const result = await sendNotificationsInternal(filters);

        console.log(`[Trigger] Completed ${type}:`, result);

        res.json({
            success: true,
            message: `Trigger processed successfully`,
            stats: result
        });

    } catch (error) {
        console.error('[Trigger] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getLatestEmail = async (req: Request, res: Response) => {
    try {
        const SENT_EMAILS_DIR = path.join(__dirname, '../services/email/sent_emails');
        if (!fs.existsSync(SENT_EMAILS_DIR)) {
            return res.status(404).send('No emails found');
        }

        const files = fs.readdirSync(SENT_EMAILS_DIR);
        const indices = files
            .filter(f => f.startsWith('email_') && f.endsWith('.html'))
            .map(f => parseInt(f.replace('email_', '').replace('.html', '')))
            .filter(n => !isNaN(n));

        if (indices.length === 0) {
            return res.status(404).send('No emails found');
        }

        const maxId = Math.max(...indices);
        const filePath = path.join(SENT_EMAILS_DIR, `email_${maxId}.html`);
        const content = fs.readFileSync(filePath, 'utf-8');

        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } catch (error) {
        console.error('Error fetching latest email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
