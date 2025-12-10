import * as React from "react";
import { Text, Button } from "@react-email/components";
import { BaseTemplate } from "../BaseTemplate";
import { EmailConfig } from "../types";

interface WelcomeTemplateProps {
    name: string;
    urlLink: string;
    messageBody?: string;
    config: EmailConfig;
}

export const WelcomeTemplate = ({
    name,
    urlLink,
    messageBody,
    config,
}: WelcomeTemplateProps) => {
    return (
        <BaseTemplate preview="Welcome to Investrio!" config={config}>
            <Text>Hi {name}!</Text>
            {messageBody && <Text>{messageBody}</Text>}
            <Button href={urlLink} style={{ backgroundColor: config.theme.primary, color: "#fff", padding: "12px 20px", borderRadius: "5px", textDecoration: "none" }}>Get Started</Button>
        </BaseTemplate>
    );
};
