import * as React from "react";
import { Text } from "@react-email/components";
import { BaseTemplate } from "../BaseTemplate";
import { EmailConfig } from "../types";

interface VerificationCodeTemplateProps {
    name: string;
    verificationCode: string;
    messageBody?: string;
    config: EmailConfig;
}

export const VerificationCodeTemplate = ({
    name,
    verificationCode,
    messageBody,
    config,
}: VerificationCodeTemplateProps) => {
    return (
        <BaseTemplate preview="Verify your email" config={config}>
            <Text>Hello {name},</Text>
            <Text>Your verification code is:</Text>
            <Text style={{ fontSize: "24px", fontWeight: "bold" }}>{verificationCode}</Text>
            {messageBody && <Text>{messageBody}</Text>}
        </BaseTemplate>
    );
};
