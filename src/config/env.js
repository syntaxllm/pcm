export const env = {
  PORT: process.env.PORT || 3333,
  SKARYA_API_URL: process.env.SKARYA_API_URL,
  SKARYA_AUTH_URL: process.env.SKARYA_AUTH_URL,
  NODE_ENV: process.env.NODE_ENV || "development"
};

if (!env.SKARYA_API_URL || !env.SKARYA_AUTH_URL) {
  throw new Error("Missing required environment variables");
}
