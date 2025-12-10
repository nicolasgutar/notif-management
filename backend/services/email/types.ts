export type templateName =
    | "welcomeTemplate"
    | "inviteTemplate"
    | "verificationCodeTemplate";

export type InviterType = "bookkeeper" | "system";

export interface EmailRequest {
    to: string;
    name?: string;
    templateName: templateName;
    verificationCode?: string;
    inviterName?: string;
    inviterId?: string;
    inviterType?: InviterType;
    inviterPhotoUrl?: string | null;
    urlLink?: string;
    messageBody?: string;
    customData?: Record<string, any>;
    theme?: {
        primary?: string;
        secondary?: string;
        background?: string;
        text?: string;
    };
    images?: {
        logo?: string;
        headerImage?: string;
        footerImage?: string;
        backgroundImage?: string;
        profileImage?: string;
    };
    company?: {
        name?: string;
        signature?: {
            name?: string;
            title?: string;
            email?: string;
        };
    };
}

export interface InviteEmailRequest extends EmailRequest {
    inviterId: string;
    inviterName: string;
}

export interface EmailConfig {
    theme: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
    images: {
        logo: string;
        headerImage: string;
        footerImage: string;
        backgroundImage?: string;
        profileImage: string;
    };
    company: {
        name: string;
        signature: {
            name: string;
            title: string;
            email: string;
        };
    };
    inviterType?: InviterType;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface EmailMessage {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export interface EmailService {
    sendEmail(message: EmailMessage): Promise<EmailResult>;
}
