import prisma from '../../database/client';
import { AllCategories } from '../types';

export const query = async () => {
    const transactions = await prisma.transaction.findMany({
        where: {
            amount: { gte: 25 },
            category: AllCategories.FOOD_AND_DRINK, // Strict match
            OR: [
                { description: null },
                { description: '' },
                {
                    NOT: {
                        description: { contains: 'Attendee', mode: 'insensitive' }
                    }
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
