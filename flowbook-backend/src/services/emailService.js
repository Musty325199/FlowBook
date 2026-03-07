import { Resend } from "resend";

export const sendEmail = async (to, subject, html) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("RESEND_API_KEY is missing in environment variables");
      return;
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "FlowBook <onboarding@resend.dev>",
      to,
      subject,
      html
    });

  } catch (error) {
    console.error("Email sending failed:", error);
  }
};