
import dotenv from 'dotenv';
import path from 'path';

// Load env vars first
dotenv.config({ path: path.join(__dirname, '../.env') });

import prisma from '../database/client';
import { schedulerService } from '../services/scheduler.service';

const NOTIFICATIONS = [
    {
        id: 'tax_payment_final_last_year',
        name: 'Final Tax Payment Due (Last Year)',
        description: 'Reminder to send final estimated tax payment for the previous year',
        schedule: '0 9 15 1 *', // Jan 15 at 9 AM
        template: '{username}, remember to send the final estimated payment for {lastYear}.',
        channels: ['APN'] // Default channels
    },
    {
        id: 'send_forms_employees',
        name: 'Send 1099s & W-2s',
        description: 'Reminder to give W-2 and 1099 forms to employees/contractors',
        schedule: '0 9 2 2 *', // Feb 2 at 9 AM
        template: '{username}, remember to give W-2 forms to employees and 1099 forms to any contractors you paid over $600 in {lastYear}.',
        channels: ['APN']
    },
    {
        id: 'submit_forms_irs',
        name: 'Submit 1099s & W-2s to IRS',
        description: 'Reminder to file W-2s and 1099s with the government',
        schedule: '0 9 2 2 *', // Feb 2 at 9 AM (Same time, different notification)
        template: '{username}, remember to file those W-2s and 1099s with the government.',
        channels: ['APN']
    },
    {
        id: 'tax_payment_q1',
        name: 'Q1 Estimated Tax Payment Due',
        description: 'Reminder for Q1 estimated tax payment',
        schedule: '0 9 15 4 *', // Apr 15 at 9 AM
        template: '{username}, remember to send your first estimated tax payment for this year ({year}).',
        channels: ['APN']
    },
    {
        id: 'retirement_contribution_deadline',
        name: 'Retirement Contribution Deadline',
        description: 'Last chance for IRA/HSA contributions for previous tax year',
        schedule: '0 9 15 4 *', // Apr 15 at 9 AM
        template: '{username}, remember it is the last chance to put money into your IRA/HSA for the {lastYear} tax year.',
        channels: ['APN']
    },
    {
        id: 'tax_payment_q2',
        name: 'Q2 Estimated Tax Payment Due',
        description: 'Reminder for Q2 estimated tax payment',
        schedule: '0 9 15 6 *', // Jun 15 at 9 AM
        template: '{username}, remember to send your second estimated tax payment for this year ({year}).',
        channels: ['APN']
    },
    {
        id: 'tax_payment_q3',
        name: 'Q3 Estimated Tax Payment Due',
        description: 'Reminder for Q3 estimated tax payment',
        schedule: '0 9 15 9 *', // Sep 15 at 9 AM
        template: '{username}, remember to send your third estimated tax payment for this year ({year}).',
        channels: ['APN']
    }
];

async function main() {
    console.log('Starting Bookkeeping Notification Setup (TEST - EVERY MINUTE)...');

    for (const notif of NOTIFICATIONS) {
        console.log(`Processing: ${notif.name}`);

        // 1. Create/Update Template
        await prisma.notificationTemplate.upsert({
            where: { id: notif.id },
            update: {
                name: notif.name,
                description: notif.description,
                template: notif.template,
                channels: notif.channels
            },
            create: {
                id: notif.id,
                name: notif.name,
                description: notif.description,
                template: notif.template,
                channels: notif.channels
            }
        });
        console.log(`  - Template upserted.`);

        // 2. Create Cloud Scheduler Job (OVERRIDE SCHEDULE)
        try {
            await schedulerService.createJob(
                notif.id, // uses ID as job name suffix
                notif.description,
                '* * * * *', // Every minute
                { type: notif.id, channel: 'APN' }
            );
            console.log(`  - Job created/updated (Every Minute).`);
        } catch (error) {
            console.error(`  - Error creating job for ${notif.id}:`, error);
        }
    }

    console.log('Setup Complete.');
    console.log('WARNING: The jobs are now running every minute. Please delete/disable them in Cloud Scheduler console after verifying.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
