export const env = {
  PORT: process.env.PORT || 3333,
  SKARYA_API_URL: process.env.SKARYA_API_URL,
  SKARYA_AUTH_URL: process.env.SKARYA_AUTH_URL,
  NODE_ENV: process.env.NODE_ENV || "development"
};

if (!env.SKARYA_API_URL) {
  throw new Error("Missing required environment variable: SKARYA_API_URL");
}

// In development/test mode with a dev token, we don't strictly need the auth url
if (!env.SKARYA_AUTH_URL && !process.env.DEV_ACCESS_TOKEN) {
  throw new Error("Missing required environment variable: SKARYA_AUTH_URL");
}
