import dotenv from "dotenv";
dotenv.config();

const getEnv = (key: string) => {
  if (!key) throw new Error("Key is required");
  const value = process.env[key];
  if (!value) throw new Error(`Missing env variable: ${key}`);

  return value;
};

export const env = {
  port: Number(getEnv("PORT")),
  nodeEnv: getEnv("NODE_ENV"),
  clientUrl: getEnv("CLIENT_URL"),
  databaseUrl: getEnv("DATABASE_URL"),
  jwtAccessSecret:getEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET"),
  googleClientId: getEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
  googleCallbackUrl: getEnv("GOOGLE_CALLBACK_URL"),
  cloudinaryCloudName: getEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: getEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: getEnv("CLOUDINARY_API_SECRET"),
  razorpayKeyId: getEnv("RAZORPAY_KEY_ID"),
  razorpayKeySecret: getEnv("RAZORPAY_KEY_SECRET"),
  smtpHost: getEnv("SMTP_HOST"),
  smtpPort: getEnv("SMTP_PORT"),
  smtpUser: getEnv("SMTP_USER"),
  smtpPassword: getEnv("SMTP_PASSWORD"),
  smtpFrom: getEnv("SMTP_FROM"),
};