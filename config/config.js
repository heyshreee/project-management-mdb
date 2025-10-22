module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL,
  API_VERSION: process.env.API_VERSION || "v1",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
  URLS: {
    VERIFY_URL: process.env.VERIFY_URL || "/api/v1/verify-admin",
    API_URL: process.env.API_URL || "/api/v1/projects",
  },
};
