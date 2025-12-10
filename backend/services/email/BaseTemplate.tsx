import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Row,
    Column,
} from "@react-email/components";
import * as React from "react";

export interface BaseTemplateProps {
    preview: string;
    children: React.ReactNode;
    config: {
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
            profileImage: string;
            backgroundImage?: string;
        };
        company: {
            name: string;
            signature: {
                name: string;
                title: string;
                email: string;
            };
        };
    };
}

const SOCIAL_LINKS = [
    {
        url: "https://www.instagram.com/investrio.io",
        icon: "https://storage.googleapis.com/investrio-images/assets/instagram.png",
    },
    {
        url: "https://www.linkedin.com/company/investriofinance/",
        icon: "https://storage.googleapis.com/investrio-images/assets/linkedin-icon-seeklogo.png",
    },
    {
        url: "https://www.threads.net/@investrio.io",
        icon: "https://storage.googleapis.com/investrio-images/assets/threads.png",
    },
    {
        url: "https://www.youtube.com/@investrio",
        icon: "https://storage.googleapis.com/investrio-images/assets/youtube.png",
    },
];

export const BaseTemplate = ({
    preview,
    children,
    config,
}: BaseTemplateProps) => {
    const { company } = config;

    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Body style={styles.main}>
                <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={styles.backgroundTable}
                >
                    <tbody>
                        <tr>
                            <td>
                                <Container style={styles.container}>
                                    <Section style={styles.headerSection}>
                                        <Img
                                            src="https://storage.googleapis.com/investrio-images/assets/small-full-logo-cropped.png"
                                            alt={`${company.name} Logo`}
                                            style={styles.logo}
                                        />
                                    </Section>

                                    <Section style={styles.contentSection}>{children}</Section>

                                    <Section style={styles.footerAddressSection}>
                                        <Text style={styles.addressText}>
                                            866 United Nations Plaza
                                            <br />
                                            New York City, NY 10017, USA
                                        </Text>
                                    </Section>

                                    <Section style={styles.socialsContainer}>
                                        <Row>
                                            {SOCIAL_LINKS.map(({ url, icon }) => (
                                                <Column key={url} style={styles.socialColumn}>
                                                    <table
                                                        cellPadding="0"
                                                        cellSpacing="0"
                                                        align="center"
                                                        style={styles.socialTable}
                                                    >
                                                        <tbody>
                                                            <tr>
                                                                <td align="center" valign="middle">
                                                                    <Link href={url} target="_blank">
                                                                        <Img src={icon} width="20" height="20" />
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </Column>
                                            ))}
                                        </Row>
                                    </Section>

                                    <Section style={styles.unsubscribeSection}>
                                        <Text style={styles.unsubscribeText}>
                                            © {new Date().getFullYear()} {company.name}. All rights
                                            reserved.
                                        </Text>
                                    </Section>
                                </Container>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Body>
        </Html>
    );
};

const styles = {
    main: {
        margin: 0,
        padding: 0,
        fontFamily:
            'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
        backgroundColor: "#f3ecff",
    },
    backgroundTable: {
        width: "100%",
        minHeight: "100vh",
    },
    container: {
        backgroundColor: "#ffffff",
        margin: "40px auto",
        maxWidth: "600px",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    },
    headerSection: {
        backgroundColor: "#11083a",
        padding: "24px",
    },
    logo: {
        height: "auto",
        width: "180px",
    },
    contentSection: {
        padding: "30px 40px",
    },
    footerAddressSection: {
        padding: "20px 20px 0",
        textAlign: "center" as const,
    },
    addressText: {
        color: "#6b7280",
        fontSize: "12px",
        margin: "0",
        lineHeight: "1.5",
    },
    socialsContainer: {
        width: "35%",
        margin: "0 auto",
        padding: "20px 0",
        opacity: 0.6,
    },
    socialColumn: {
        width: "25%",
    },
    socialTable: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "1px solid rgba(0, 0, 0, 0.6)",
    },
    socialIcon: {
        margin: "auto",
        verticalAlign: "middle",
    },
    unsubscribeSection: {
        padding: "20px",
        textAlign: "center" as const,
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
    },
    unsubscribeText: {
        color: "#6b7280",
        fontSize: "12px",
        margin: "0",
    },
};
