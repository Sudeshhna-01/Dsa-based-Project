// Validate required environment variables on startup

const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME'
];

const optionalEnvVars = {
  'PORT': '3000',
  'NODE_ENV': 'development',
  'DB_PORT': '5432'
};

export const validateEnv = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security');
  }

  // Check NODE_ENV
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    warnings.push('NODE_ENV should be one of: development, production, test');
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\nPlease set these in your .env file');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Set defaults for optional variables
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }

  console.log('✅ Environment variables validated');
};

