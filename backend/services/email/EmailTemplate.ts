import { render } from "@react-email/render";
import type { EmailConfig, EmailRequest } from "./types";
import { WelcomeTemplate } from "./templates/welcome-template";
import { VerificationCodeTemplate } from "./templates/verification-code-template";
import { InviteTemplate } from "./templates/invite-template";

export class EmailTemplate {
    private config: EmailConfig;

    constructor(config: EmailConfig) {
        this.config = config;
    }

    async generate(request: EmailRequest): Promise<{
        html: string;
        text: string;
        subject: string;
    }> {
        const { html, text } = await this.renderTemplate(request);
        const subject = this.generateSubject(request.templateName, request);

        return { html, text, subject };
    }

    private async renderTemplate(request: EmailRequest): Promise<{
        html: string;
        text: string;
    }> {
        let templateComponent;

        switch (request.templateName) {
            case "inviteTemplate":
                templateComponent = InviteTemplate({
                    name: request.name || "",
                    inviterName: request.inviterName || "Team",
                    inviterType: request.inviterType || "system",
                    urlLink: request.urlLink || "#",
                    messageBody: request.messageBody,
                    config: this.config,
                });
                break;

            case "verificationCodeTemplate": {
                if (request.verificationCode === undefined) {
                    throw new Error("No verification code found");
                }
                templateComponent = VerificationCodeTemplate({
                    name: request.name || "",
                    verificationCode: request.verificationCode,
                    messageBody: request.messageBody,
                    config: this.config,
                });
                break;
            }
            case "welcomeTemplate":
                templateComponent = WelcomeTemplate({
                    name: request.name || "",
                    urlLink: request.urlLink || "#",
                    messageBody: request.messageBody,
                    config: this.config,
                });
                break;
            default:
                throw new Error("Unrecognized Template");
        }

        const html = await render(templateComponent);
        const text = await render(templateComponent, { plainText: true });

        return { html, text };
    }

    private generateSubject(templateName: string, request: EmailRequest): string {
        console.log("generateSubject(template, request) called");
        console.log(templateName);
        console.log(request);

        const subjects = {
            inviteTemplate: `You've been invited to join ${this.config.company.name}`,
            welcomeTemplate: `Welcome to ${this.config.company.name}!`,
            motivationTemplate: `Monday Motivation - ${this.config.company.name}`,
            verificationCodeTemplate: `Verify your Email for ${this.config.company.name}`,
        };

        return (
            subjects[templateName as keyof typeof subjects] || subjects.inviteTemplate
        );
    }
}
