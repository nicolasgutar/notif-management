import prisma from '../../database/client';
import { AllCategories, SHOPPING_CATEGORIES, MARKETPLACE_MERCHANTS, TRAVEL_CATEGORIES, EVENT_CATEGORIES } from '../types';

export const query = async () => {
    // 1. Marketplaces + Special Categories missing receipts
    const missingReceipts = await prisma.transaction.groupBy({
        by: ['userId'],
        _count: {
            id: true
        },
        where: {
            accountCategory: 'business',
            receiptUrl: null,
            OR: [
                // Marketplace logic
                {
                    amount: { gt: 25 },
                    category: { in: SHOPPING_CATEGORIES },
                    merchantName: { in: MARKETPLACE_MERCHANTS, mode: 'insensitive' }
                },
                // Special Category logic
                { category: { in: TRAVEL_CATEGORIES } },
                { category: AllCategories.FOOD_AND_DRINK, amount: { gt: 25 } },
                { category: { in: EVENT_CATEGORIES }, amount: { gt: 25 } }
            ]
        }
    });

    // 2. Missing Notes
    const missingNotes = await prisma.transaction.groupBy({
        by: ['userId'],
        _count: {
            id: true
        },
        where: {
            accountCategory: 'business',
            OR: [{ description: null }, { description: '' }],
            category: {
                in: [
                    ...SHOPPING_CATEGORIES,
                    ...TRAVEL_CATEGORIES,
                    ...EVENT_CATEGORIES,
                    AllCategories.FOOD_AND_DRINK
                ]
            }
        }
    });

    // 3. Missing Attendees (Food only)
    const missingAttendees = await prisma.transaction.groupBy({
        by: ['userId'],
        _count: {
            id: true
        },
        where: {
            amount: { gte: 25 },
            category: AllCategories.FOOD_AND_DRINK,
            NOT: { description: { contains: 'Attendee', mode: 'insensitive' } }
        }
    });

    // Aggregate results by userId
    const userStats: Record<string, { missingReceipts: number, missingNotes: number, missingAttendees: number, deviceToken?: string | null }> = {};

    const processGroup = (group: typeof missingReceipts, key: 'missingReceipts' | 'missingNotes' | 'missingAttendees') => {
        group.forEach(item => {
            if (!userStats[item.userId]) {
                userStats[item.userId] = { missingReceipts: 0, missingNotes: 0, missingAttendees: 0 };
            }
            userStats[item.userId][key] = item._count.id;
        });
    };

    processGroup(missingReceipts, 'missingReceipts');
    processGroup(missingNotes, 'missingNotes');
    processGroup(missingAttendees, 'missingAttendees');

    // Fetch device tokens for all users in userStats
    const userIds = Object.keys(userStats);
    if (userIds.length > 0) {
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, deviceToken: true }
        });

        users.forEach(user => {
            if (userStats[user.id]) {
                userStats[user.id].deviceToken = user.deviceToken;
            }
        });
    }

    return userStats;
};
