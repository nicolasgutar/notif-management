import prisma from '../../database/client';
import { AllCategories, SHOPPING_CATEGORIES, TRAVEL_CATEGORIES, EVENT_CATEGORIES } from '../types';

export const query = async () => {
    const transactions = await prisma.transaction.findMany({
        where: {
            accountCategory: 'business',
            OR: [
                { description: null },
                { description: '' }
            ],
            // Combine all "Description Sensitive" categories
            category: {
                in: [
                    ...SHOPPING_CATEGORIES,
                    ...TRAVEL_CATEGORIES,
                    ...EVENT_CATEGORIES,
                    AllCategories.FOOD_AND_DRINK
                ]
            }
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
