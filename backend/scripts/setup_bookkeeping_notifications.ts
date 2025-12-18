
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
        reminderSchedule: '0 9 8 1 *', // Jan 8 at 9 AM (1 week prior)
        template: '{username}, remember to send the final estimated payment for {lastYear}.',
        channels: ['APN'] // Default channels
    },
    {
        id: 'send_forms_employees',
        name: 'Send 1099s & W-2s',
        description: 'Reminder to give W-2 and 1099 forms to employees/contractors',
        schedule: '0 9 2 2 *', // Feb 2 at 9 AM
        reminderSchedule: '0 9 26 1 *', // Jan 26 at 9 AM (1 week prior - Feb 2 is day 33, minus 7 = day 26)
        template: '{username}, remember to give W-2 forms to employees and 1099 forms to any contractors you paid over $600 in {lastYear}.',
        channels: ['APN']
    },
    {
        id: 'submit_forms_irs',
        name: 'Submit 1099s & W-2s to IRS',
        description: 'Reminder to file W-2s and 1099s with the government',
        schedule: '0 9 2 2 *', // Feb 2 at 9 AM (Same time, different notification)
        reminderSchedule: '0 9 26 1 *', // Jan 26 at 9 AM (1 week prior)
        template: '{username}, remember to file those W-2s and 1099s with the government.',
        channels: ['APN']
    },
    {
        id: 'tax_payment_q1',
        name: 'Q1 Estimated Tax Payment Due',
        description: 'Reminder for Q1 estimated tax payment',
        schedule: '0 9 15 4 *', // Apr 15 at 9 AM
        reminderSchedule: '0 9 8 4 *', // Apr 8 at 9 AM (1 week prior)
        template: '{username}, remember to send your first estimated tax payment for this year ({year}).',
        channels: ['APN']
    },
    {
        id: 'retirement_contribution_deadline',
        name: 'Retirement Contribution Deadline',
        description: 'Last chance for IRA/HSA contributions for previous tax year',
        schedule: '0 9 15 4 *', // Apr 15 at 9 AM
        reminderSchedule: '0 9 8 4 *', // Apr 8 at 9 AM (1 week prior)
        template: '{username}, remember it is the last chance to put money into your IRA/HSA for the {lastYear} tax year.',
        channels: ['APN']
    },
    {
        id: 'tax_payment_q2',
        name: 'Q2 Estimated Tax Payment Due',
        description: 'Reminder for Q2 estimated tax payment',
        schedule: '0 9 15 6 *', // Jun 15 at 9 AM
        reminderSchedule: '0 9 8 6 *', // Jun 8 at 9 AM (1 week prior)
        template: '{username}, remember to send your second estimated tax payment for this year ({year}).',
        channels: ['APN']
    },
    {
        id: 'tax_payment_q3',
        name: 'Q3 Estimated Tax Payment Due',
        description: 'Reminder for Q3 estimated tax payment',
        schedule: '0 9 15 9 *', // Sep 15 at 9 AM
        reminderSchedule: '0 9 8 9 *', // Sep 8 at 9 AM (1 week prior)
        template: '{username}, remember to send your third estimated tax payment for this year ({year}).',
        channels: ['IN_APP', 'EMAIL']
    }
];

async function main() {
    console.log('Starting Bookkeeping Notification Setup (With Reminders)...');

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

        // 2. Create PRIMARY Cloud Scheduler Job
        try {
            await schedulerService.createJob(
                notif.id,
                notif.description,
                notif.schedule,
                { type: notif.id, channel: 'APN' }
            );
            console.log(`  - Primary Job created/updated.`);
        } catch (error) {
            console.error(`  - Error creating primary job for ${notif.id}:`, error);
        }

        // 3. Create REMINDER Cloud Scheduler Job (1 Week Prior)
        if (notif.reminderSchedule) {
            const reminderId = `${notif.id}_reminder_1w`;
            try {
                await schedulerService.createJob(
                    reminderId,
                    `${notif.description} (1 Week Reminder)`,
                    notif.reminderSchedule,
                    // We trigger the same notification type. 
                    // The user requested: "notifies the user a week prior as well"
                    // If we use the same type, the message will be the same ("Remember to...").
                    // If we wanted a DIFFERENT message ("In 1 week, remember to..."), we'd need a new template.
                    // Given the request "notifies the user a week prior as well", sending the same "Remember to..." message is appropriate and simpler.
                    // It acts as an early reminder.
                    { type: notif.id, channel: 'APN' }
                );
                console.log(`  - Reminder Job created/updated (${reminderId}).`);
            } catch (error) {
                console.error(`  - Error creating reminder job for ${reminderId}:`, error);
            }
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
