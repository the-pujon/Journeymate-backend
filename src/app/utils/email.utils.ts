import nodemailer from "nodemailer";
import config from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
) => {
  try {
    await transporter.sendMail({
      from: config.email_user,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendRecoveryEmail = async (
  email: string,
  recoveryCode: string,
) => {
  const subject = "Password Recovery Code";
  const text = `Your password recovery code is: ${recoveryCode}`;
  const html = `<p>Your password recovery code is: <strong>${recoveryCode}</strong></p>`;

  await sendEmail(email, subject, text, html);
};
