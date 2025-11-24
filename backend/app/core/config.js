// Backend Configuration
module.exports = {
    PORT: process.env.PORT || 3000,
    DATABASE_PATH: process.env.DATABASE_PATH || 'pm.db',
    CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
    NODE_ENV: process.env.NODE_ENV || 'development'
};

