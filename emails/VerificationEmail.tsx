import * as React from "react";
import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Text,
	Heading,
	Hr,
} from "@react-email/components";

interface VerificationEmailProps {
	username: string;
	code: string;
	supportEmail?: string;
	appName?: string;
}

export function VerificationEmail({
	username,
	code,
	supportEmail = "support@yourdomain.com",
	appName = "Anonymous",
}: VerificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>
				Your {appName} verification code: {code}
			</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					<Heading style={styles.heading}>{appName} Email Verification</Heading>
					<Text style={styles.text}>Hi {username},</Text>
					<Text style={styles.text}>
						Use the verification code below. It expires in 60 minutes.
					</Text>
					<Section style={styles.codeBox}>
						{" "}
						<Text style={styles.code}>{code}</Text>
					</Section>
					<Text style={styles.text}>
						If you didn’t request this, you can ignore this email.
					</Text>
					<Hr style={styles.hr} />
					<Text style={styles.footer}>
						Need help? Contact us at {supportEmail}
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const styles: Record<string, React.CSSProperties> = {
	body: {
		backgroundColor: "#f5f5f7",
		fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
		padding: "24px",
	},
	container: {
		background: "#ffffff",
		maxWidth: "560px",
		margin: "0 auto",
		borderRadius: "12px",
		padding: "40px 32px",
		border: "1px solid #eceef1",
	},
	heading: { fontSize: "24px", margin: "0 0 16px", color: "#111827" },
	text: {
		fontSize: "15px",
		lineHeight: "22px",
		color: "#374151",
		margin: "0 0 16px",
	},
	codeBox: {
		background: "#111827",
		borderRadius: "8px",
		textAlign: "center",
		padding: "20px",
		margin: "12px 0 28px",
	},
	code: {
		fontSize: "38px",
		letterSpacing: "6px",
		fontWeight: 600,
		color: "#ffffff",
		margin: 0,
	},
	hr: { border: "none", borderTop: "1px solid #e5e7eb", margin: "32px 0" },
	footer: { fontSize: "12px", color: "#6b7280", margin: 0 },
};

export default VerificationEmail;
