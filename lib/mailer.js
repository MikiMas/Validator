import nodemailer from "nodemailer";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export async function sendEmail({ subject, text, to }) {
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");
  const resolvedTo = to || getRequiredEnv("SMTP_TO");
  const from = process.env.SMTP_FROM || user;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({ from, to: resolvedTo, subject, text });
}

export async function sendRollbackEmail({ subject, text }) {
  return sendEmail({ subject, text });
}
