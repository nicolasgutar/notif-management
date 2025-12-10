import sgMail from '@sendgrid/mail';

// Unused. To be replaced with Seans actual implementation

/*
const API_KEY = process.env.SENDGRID_API_KEY || 'SG.placeholder';
sgMail.setApiKey(API_KEY);

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        const msg = {
            to,
            from: 'notifications@investrio.com', // Change to your verified sender
            subject,
            text,
            html: html || text,
        };

        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        if ((error as any).response) {
            console.error((error as any).response.body);
        }
        return false;
    }
};
*/