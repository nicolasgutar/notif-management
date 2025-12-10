import fs from 'fs';
import path from 'path';
import { EmailService, EmailMessage, EmailResult } from './types';

const SENT_EMAILS_DIR = path.join(__dirname, 'sent_emails');

export class MockEmailService implements EmailService {
    constructor() {
        if (!fs.existsSync(SENT_EMAILS_DIR)) {
            fs.mkdirSync(SENT_EMAILS_DIR, { recursive: true });
        }
    }

    async sendEmail(message: EmailMessage): Promise<EmailResult> {
        try {
            const files = fs.readdirSync(SENT_EMAILS_DIR);
            // Filter for email_*.html files and extract numbers
            const indices = files
                .filter(f => f.startsWith('email_') && f.endsWith('.html'))
                .map(f => parseInt(f.replace('email_', '').replace('.html', '')))
                .filter(n => !isNaN(n));

            const nextId = indices.length > 0 ? Math.max(...indices) + 1 : 1;
            const filename = `email_${nextId}.html`;
            const filePath = path.join(SENT_EMAILS_DIR, filename);

            // Add some metadata to the HTML for easier debugging
            const htmlContent = `
<!-- 
To: ${message.to}
Subject: ${message.subject}
Date: ${new Date().toISOString()}
-->
${message.html}
            `;

            fs.writeFileSync(filePath, htmlContent);
            console.log(`Email saved to ${filePath}`);

            return { success: true, messageId: filename };
        } catch (error) {
            console.error('Error saving email:', error);
            return { success: false, error: String(error) };
        }
    }
}

export const emailService = new MockEmailService();
