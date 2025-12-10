import * as React from "react";
import { Text, Button } from "@react-email/components";
import { BaseTemplate } from "../BaseTemplate";
import { EmailConfig } from "../types";

interface InviteTemplateProps {
    name: string;
    inviterName: string;
    inviterType: string;
    urlLink: string;
    messageBody?: string;
    config: EmailConfig;
}

export const InviteTemplate = ({
    name,
    inviterName,
    urlLink,
    messageBody,
    config,
}: InviteTemplateProps) => {
    return (
        <BaseTemplate preview={`You've been invited by ${inviterName}`} config={config}>
            <Text>Hello {name},</Text>
            <Text>{inviterName} has invited you to join Investrio.</Text>
            {messageBody && <Text>{messageBody}</Text>}
            <Button href={urlLink} style={{ backgroundColor: config.theme.primary, color: "#fff", padding: "12px 20px", borderRadius: "5px", textDecoration: "none" }}>Join Now</Button>
        </BaseTemplate>
    );
};
