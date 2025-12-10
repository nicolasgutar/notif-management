import prisma from '../../database/client';
import { SHOPPING_CATEGORIES, MARKETPLACE_MERCHANTS } from '../types';

export const query = async () => {
    const transactions = await prisma.transaction.findMany({
        where: {
            accountCategory: 'business',
            amount: { gt: 25 },
            receiptUrl: null,
            // Strict Enum Matching
            category: { in: SHOPPING_CATEGORIES },
            merchantName: {
                in: MARKETPLACE_MERCHANTS,
                mode: 'insensitive'
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
