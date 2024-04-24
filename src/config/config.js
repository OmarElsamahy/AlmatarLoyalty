const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define the schema for environment variable validation
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('Access tokens expiration time'),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('Refresh tokens expiration time'),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10).description('Reset password token expiration'),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10).description('Verify email token expiration'),
  SMTP_HOST: Joi.string().description('SMTP server host'),
  SMTP_PORT: Joi.number().description('SMTP server port'),
  SMTP_USERNAME: Joi.string().description('SMTP server username'),
  SMTP_PASSWORD: Joi.string().description('SMTP server password'),
  EMAIL_FROM: Joi.string().description('Email "from" field'),

  // PostgreSQL-specific variables
  PG_DATABASE: Joi.string().required().description('PostgreSQL database name'),
  PG_USERNAME: Joi.string().required().description('PostgreSQL username'),
  PG_PASSWORD: Joi.string().required().description('PostgreSQL password'),
  PG_HOST: Joi.string().required().description('PostgreSQL host'),
  PG_PORT: Joi.number().required().description('PostgreSQL port'),
}).unknown(); // Allow unknown keys

// Validate environment variables
const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export the configuration
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  sequelize: {
    database: envVars.PG_DATABASE,
    username: envVars.PG_USERNAME,
    password: envVars.PG_PASSWORD,
    host: envVars.PG_HOST,
    port: envVars.PG_PORT,
    dialect: 'postgres', // Use PostgreSQL
    logging: envVars.NODE_ENV === 'development', // Log only in development
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
