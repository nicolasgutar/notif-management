
import dotenv from 'dotenv';
import path from 'path';

// Load env vars first
dotenv.config({ path: path.join(__dirname, '../.env') });

import prisma from '../database/client';
import { schedulerService } from '../services/scheduler.service';

const NOTIFICATIONS = [
    // --- LLC Reminders (previously Solo/DBA/Single-Member LLC) ---
    {
        id: 'reminder_llc_tax_return',
        name: 'LLC: File Your Tax Return',
        description: 'Reminder for LLC/Solo/DBA to file personal tax return (Form 1040)',
        schedule: '0 9 8 4 *', // Apr 8 (1 week before Apr 15)
        template: '{username}, remember to file your personal tax return (Form 1040) and pay any remaining tax. This includes your business income (Schedule C).',
        channels: ['APN']
    },
    {
        id: 'reminder_llc_extension',
        name: 'LLC: Apply for Filing Extension',
        description: 'Reminder for LLC/Solo/DBA to file extension if needed',
        schedule: '0 9 8 4 *', // Apr 8 (1 week before Apr 15)
        template: '{username}, if you need more time to file your tax return, remember to submit an extension request. (Note: You still have to pay the tax you owe by April 15).',
        channels: ['APN']
    },
    {
        id: 'reminder_llc_extended_deadline',
        name: 'LLC: Extended Filing Deadline',
        description: 'Reminder for LLC/Solo/DBA extended filing deadline',
        schedule: '0 9 8 10 *', // Oct 8 (1 week before Oct 15)
        template: '{username}, remember to file your tax return if you filed for an extension earlier.',
        channels: ['APN']
    },

    // --- S-Corp Reminders ---
    {
        id: 'reminder_scorp_business_return',
        name: 'S-Corp: File Business Tax Return',
        description: 'Reminder for S-Corp to file business tax return',
        schedule: '0 9 9 3 *', // Mar 9 (1 week before Mar 16)
        template: '{username}, remember to submit your company\'s informational tax report (Form 1120-S or 1065).',
        channels: ['APN']
    },
    {
        id: 'reminder_scorp_k1',
        name: 'S-Corp: Send Tax Info to Owners (K-1)',
        description: 'Reminder for S-Corp to send K-1s',
        schedule: '0 9 9 3 *', // Mar 9 (1 week before Mar 16)
        template: '{username}, remember to send the tax details (Schedule K-1) to all owners so they can do their personal taxes.',
        channels: ['APN']
    },
    {
        id: 'reminder_scorp_extension',
        name: 'S-Corp: Apply for Extension',
        description: 'Reminder for S-Corp to file business extension',
        schedule: '0 9 9 3 *', // Mar 9 (1 week before Mar 16)
        template: '{username}, if the business needs more time to file its report, remember to submit an extension request.',
        channels: ['APN']
    },
    {
        id: 'reminder_scorp_personal_return',
        name: 'S-Corp Owners: File Personal Tax Return',
        description: 'Reminder for S-Corp owners to file personal return',
        schedule: '0 9 8 4 *', // Apr 8 (1 week before Apr 15)
        template: '{username}, remember to file your personal tax return (Form 1040) using the K-1 info.',
        channels: ['APN']
    },
    {
        id: 'reminder_scorp_extended_business',
        name: 'S-Corp: Extended Business Filing Deadline',
        description: 'Reminder for S-Corp extended business deadline',
        schedule: '0 9 8 9 *', // Sep 8 (1 week before Sep 15)
        template: '{username}, remember to file the company\'s report if you filed for an extension in March.',
        channels: ['APN']
    },
    {
        id: 'reminder_scorp_extended_owner',
        name: 'S-Corp Owners: Extended Filing Deadline',
        description: 'Reminder for S-Corp owners extended personal deadline',
        schedule: '0 9 8 10 *', // Oct 8 (1 week before Oct 15)
        template: '{username}, remember to file your personal tax return if you filed for an extension in April.',
        channels: ['APN']
    },

    // --- C-Corp Reminders ---
    {
        id: 'reminder_ccorp_final_prev_year_payment',
        name: 'C-Corp: Final Estimated Tax Payment (Prev Year)',
        description: 'Reminder for C-Corp final estimated tax payment for the previous year',
        schedule: '0 9 8 12 *', // Dec 8
        template: '{username}, remember to send the fourth and final corporate estimated tax payment for {year}.',
        channels: ['APN']
    },
    {
        id: 'reminder_ccorp_tax_return',
        name: 'C-Corp: File Corporate Tax Return',
        description: 'Reminder for C-Corp to file Form 1120',
        schedule: '0 9 8 4 *', // Apr 8
        template: '{username}, remember to file the company\'s official tax return (Form 1120).',
        channels: ['APN']
    },
    {
        id: 'reminder_ccorp_q1_payment',
        name: 'C-Corp: Q1 Estimated Tax Payment',
        description: 'Reminder for C-Corp Q1 estimated tax payment',
        schedule: '0 9 8 4 *', // Apr 8
        template: '{username}, remember to send the first corporate estimated tax payment for this year ({year}).',
        channels: ['APN']
    },
    {
        id: 'reminder_ccorp_extension',
        name: 'C-Corp: Apply for Extension',
        description: 'Reminder for C-Corp to file extension',
        schedule: '0 9 8 4 *', // Apr 8
        template: '{username}, if the company needs more time to file its return, remember to submit an extension request.',
        channels: ['APN']
    },
    {
        id: 'reminder_ccorp_q2_payment',
        name: 'C-Corp: Q2 Estimated Tax Payment',
        description: 'Reminder for C-Corp Q2 estimated tax payment',
        schedule: '0 9 8 6 *', // Jun 8
        template: '{username}, remember to send the second corporate estimated tax payment for {year}.',
        channels: ['APN']
    },
    {
        id: 'reminder_ccorp_q3_payment',
        name: 'C-Corp: Q3 Estimated Tax Payment',
        description: 'Reminder for C-Corp Q3 estimated tax payment',
        schedule: '0 9 8 9 *', // Sep 8
        template: '{username}, remember to send the third corporate estimated tax payment for {year}.',
        channels: ['APN']
    },
    {
        id: 'reminder_ccorp_extended_deadline',
        name: 'C-Corp: Extended Filing Deadline',
        description: 'Reminder for C-Corp extended filing deadline',
        schedule: '0 9 8 10 *', // Oct 8
        template: '{username}, remember to file the company\'s return if you filed for an extension in April.',
        channels: ['APN']
    },
    {
        id: 'reminder_ccorp_final_current_year_payment',
        name: 'C-Corp: Final Estimated Tax Payment (Current Year)',
        description: 'Reminder for C-Corp final estimated tax payment for the current year',
        schedule: '0 9 8 12 *', // Dec 8
        template: '{username}, remember to send the fourth and final corporate estimated tax payment for {year}.',
        channels: ['APN']
    }
];

async function main() {
    console.log('Starting Incorporation-Based Notification Setup (Updated)...');

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

        // 2. Create Cloud Scheduler Job
        try {
            await schedulerService.createJob(
                notif.id,
                notif.description,
                notif.schedule,
                { type: notif.id, channel: 'APN' } // Ensure payload uses APN
            );
            console.log(`  - Job created/updated.`);
        } catch (error) {
            console.error(`  - Error creating job for ${notif.id}:`, error);
        }
    }

    console.log('Setup Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
