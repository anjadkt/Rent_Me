import nodemailer from "nodemailer";
import { env } from "./env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: Number(env.smtpPort),
  secure: Number(env.smtpPort) === 465,

  auth: {
    user: env.smtpUser,
    pass: env.smtpPassword,
  },
});

export default transporter;