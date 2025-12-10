import prisma from '../../database/client';
import { AllCategories, SHOPPING_CATEGORIES, TRAVEL_CATEGORIES, EVENT_CATEGORIES } from '../types';

export const query = async () => {
    const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));

    // Total transactions for the week
    const totalWeeklyTransactions = await prisma.transaction.groupBy({
        by: ['userId'],
        _count: {
            id: true
        },
        where: {
            accountCategory: 'business',
            date: { gte: oneWeekAgo }
        }
    });

    // "Incomplete" transactions (Any violation)
    const incompleteTransactions = await prisma.transaction.groupBy({
        by: ['userId'],
        _count: {
            id: true
        },
        where: {
            accountCategory: 'business',
            date: { gte: oneWeekAgo },
            OR: [
                // Violation: Missing Receipt (Complex logic simplified for general count)
                {
                    receiptUrl: null,
                    amount: { gt: 25 },
                    category: { in: [...SHOPPING_CATEGORIES, ...EVENT_CATEGORIES, AllCategories.FOOD_AND_DRINK] }
                },
                {
                    receiptUrl: null,
                    category: { in: TRAVEL_CATEGORIES } // Always needed for travel
                },
                // Violation: Missing Note
                {
                    OR: [{ description: null }, { description: '' }],
                    category: { in: [...SHOPPING_CATEGORIES, ...TRAVEL_CATEGORIES, ...EVENT_CATEGORIES, AllCategories.FOOD_AND_DRINK] }
                }
            ]
        }
    });

    // Aggregate results by userId
    const userStats: Record<string, { totalWeeklyTransactions: number, incompleteTransactions: number, deviceToken?: string | null }> = {};

    const processGroup = (group: typeof totalWeeklyTransactions, key: 'totalWeeklyTransactions' | 'incompleteTransactions') => {
        group.forEach(item => {
            if (!userStats[item.userId]) {
                userStats[item.userId] = { totalWeeklyTransactions: 0, incompleteTransactions: 0 };
            }
            userStats[item.userId][key] = item._count.id;
        });
    };

    processGroup(totalWeeklyTransactions, 'totalWeeklyTransactions');
    processGroup(incompleteTransactions, 'incompleteTransactions');

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
