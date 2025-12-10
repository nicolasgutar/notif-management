import { PrismaClient, AccountFrom, AccountCategory, ElementStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import {
    AllCategories,
    MARKETPLACE_MERCHANTS,
    SHOPPING_CATEGORIES,
    TRAVEL_CATEGORIES,
    EVENT_CATEGORIES
} from '../notifications/types';

const prisma = new PrismaClient();

const NOTIFICATION_TYPES = {
    MARKETPLACE_RECEIPT: 'receipt_needed_marketplace',
    SPECIAL_CATEGORY_RECEIPT: 'receipt_needed_special_category',
    MISSING_NOTES: 'notes_needed_general',
    MEAL_ATTENDEES: 'notes_needed_meal_attendees',
};

async function main() {
    console.log('Seeding database...');

    // Clear existing data (optional, be careful in prod)
    // await prisma.transaction.deleteMany();
    // await prisma.account.deleteMany();
    // await prisma.user.deleteMany();

    const NUM_USERS = 50;

    for (let i = 0; i < NUM_USERS; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                name: faker.person.fullName(),
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                userType: 'solopreneur',
                password: 'password123', // Dummy password
            }
        });

        console.log(`Created user: ${user.email}`);

        const numAccounts = faker.number.int({ min: 1, max: 3 });

        for (let j = 0; j < numAccounts; j++) {
            const account = await prisma.account.create({
                data: {
                    userId: user.id,
                    name: faker.finance.accountName(),
                    type: 'depository',
                    accountFrom: AccountFrom.MANUAL,
                    accountCategory: AccountCategory.business,
                    plaidAccountId: faker.string.uuid(),
                    status: ElementStatus.ACTIVE,
                }
            });

            const numTransactions = faker.number.int({ min: 20, max: 50 });
            const transactionsData = [];

            for (let k = 0; k < numTransactions; k++) {
                const isBusiness = true; // Mostly business for notifications
                const amount = parseFloat(faker.finance.amount({ min: 5, max: 500 }));
                const date = faker.date.recent({ days: 30 });

                let category = faker.helpers.arrayElement(Object.values(AllCategories));
                let merchantName = faker.company.name();
                let description = faker.lorem.sentence();
                let receiptUrl: string | null = faker.internet.url();

                // Inject scenarios
                const scenario = faker.helpers.maybe(() => faker.helpers.arrayElement([
                    'marketplace_no_receipt',
                    'travel_no_receipt',
                    'food_no_receipt',
                    'food_no_attendee',
                    'missing_note',
                    'clean'
                ]), { probability: 0.4 }) || 'clean';

                if (scenario === 'marketplace_no_receipt') {
                    category = faker.helpers.arrayElement(SHOPPING_CATEGORIES);
                    merchantName = faker.helpers.arrayElement(MARKETPLACE_MERCHANTS);
                    if (amount > 25) receiptUrl = null;
                } else if (scenario === 'travel_no_receipt') {
                    category = faker.helpers.arrayElement(TRAVEL_CATEGORIES);
                    receiptUrl = null;
                } else if (scenario === 'food_no_receipt') {
                    category = AllCategories.FOOD_AND_DRINK;
                    if (amount > 25) receiptUrl = null;
                } else if (scenario === 'food_no_attendee') {
                    category = AllCategories.FOOD_AND_DRINK;
                    if (amount > 25) description = 'Lunch with team'; // No "Attendee"
                } else if (scenario === 'missing_note') {
                    category = faker.helpers.arrayElement([...SHOPPING_CATEGORIES, ...TRAVEL_CATEGORIES, ...EVENT_CATEGORIES, AllCategories.FOOD_AND_DRINK]);
                    description = '';
                }

                transactionsData.push({
                    userId: user.id,
                    accountId: account.id,
                    accountFrom: AccountFrom.MANUAL,
                    name: merchantName,
                    merchantName: merchantName,
                    amount: amount,
                    date: date,
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    category: category,
                    description: description,
                    receiptUrl: receiptUrl,
                    accountCategory: isBusiness ? AccountCategory.business : AccountCategory.personal,
                    transactionId: faker.string.uuid(),
                    status: ElementStatus.ACTIVE
                });
            }

            await prisma.transaction.createMany({
                data: transactionsData
            });
        }
    }

    // Seed Notification Templates
    console.log('Seeding notification templates...');
    const templates = [
        {
            id: 'digest_daily_action_items',
            name: 'Daily Action Items',
            description: 'Daily digest of items requiring attention.',
            template: 'Hi {userName}, you have {totalActionItems} items requiring your attention today. Log into the app to resolve them.',
            channels: ['IN_APP', 'EMAIL']
        },
        {
            id: 'digest_weekly_summary',
            name: 'Weekly Summary',
            description: 'Weekly summary of transactions.',
            template: 'Hi {userName}, you had {totalWeeklyTransactions} transactions this week. {incompleteTransactions} need attention.',
            channels: ['EMAIL']
        },
        {
            id: 'notes_needed_general',
            name: 'Missing Notes',
            description: 'Transactions missing notes.',
            template: 'Hi {userName}, you have {count} transactions missing notes. Please add details.',
            channels: ['IN_APP']
        },
        {
            id: 'notes_needed_meal_attendees',
            name: 'Missing Meal Attendees',
            description: 'Meal expenses missing attendees.',
            template: 'Hi {userName}, please add attendees for {count} meal expenses over $25.',
            channels: ['IN_APP']
        },
        {
            id: 'receipt_needed_marketplace',
            name: 'Missing Marketplace Receipts',
            description: 'Marketplace purchases missing receipts.',
            template: 'Hi {userName}, we found {count} marketplace purchases missing receipts.',
            channels: ['IN_APP', 'EMAIL']
        },
        {
            id: 'receipt_needed_special_category',
            name: 'Missing Special Category Receipts',
            description: 'Special category expenses missing receipts.',
            template: 'Hi {userName}, you have {count} special category expenses missing receipts.',
            channels: ['IN_APP', 'EMAIL']
        }
    ];

    for (const t of templates) {
        // @ts-ignore - Prisma client might not be generated yet
        await prisma.notificationTemplate.upsert({
            where: { id: t.id },
            update: {
                name: t.name,
                description: t.description,
                template: t.template,
                channels: t.channels
            },
            create: {
                id: t.id,
                name: t.name,
                description: t.description,
                template: t.template,
                channels: t.channels
            }
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
