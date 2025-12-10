import prisma from '../../database/client';
import { AllCategories, TRAVEL_CATEGORIES, EVENT_CATEGORIES } from '../types';

export const query = async () => {
    const transactions = await prisma.transaction.findMany({
        where: {
            accountCategory: 'business',
            receiptUrl: null,
            OR: [
                // 1. Travel & Transportation (Always required)
                {
                    category: { in: TRAVEL_CATEGORIES }
                },
                // 2. Food & Drink (Required if > $25)
                {
                    amount: { gt: 25 },
                    category: AllCategories.FOOD_AND_DRINK
                },
                // 3. Events/Conferences (Required if > $25)
                {
                    amount: { gt: 25 },
                    category: { in: EVENT_CATEGORIES }
                }
            ]
        },
        select: {
            id: true,
            userId: true,
            user: {
                select: {
                    deviceToken: true
                }
            }
        }
    });

    // Group by userId
    const userTransactions: Record<string, { id: string, deviceToken?: string | null }[]> = {};
    transactions.forEach(t => {
        if (!userTransactions[t.userId]) {
            userTransactions[t.userId] = [];
        }
        userTransactions[t.userId].push({
            id: t.id,
            deviceToken: t.user.deviceToken
        });
    });

    return userTransactions;
};
