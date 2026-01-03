import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Parse database URL if provided (Render provides this)
const getDbConfig = () => {
  // If DATABASE_URL is provided (Render style), parse it
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }

  // Otherwise use individual env vars
  // For PostgreSQL, default user varies by system:
  // - Linux: usually 'postgres'
  // - macOS Homebrew: usually your system username
  const dbUser = process.env.DB_USER;
  
  // Warn if using MySQL-style 'root' user with PostgreSQL
  if (dbUser === 'root') {
    console.warn('⚠️  Warning: PostgreSQL does not use "root" user.');
    console.warn('   On macOS, use your system username or "postgres"');
    console.warn('   Please update your .env file: DB_USER=<your-username>');
  }

  // Default to system username on macOS, 'postgres' on Linux
  const defaultUser = process.platform === 'darwin' ? process.env.USER || 'postgres' : 'postgres';

  return {
    host: process.env.DB_HOST || 'localhost',
    user: dbUser && dbUser !== 'root' ? dbUser : defaultUser,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cp_analytics',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
};

const pgPool = new Pool(getDbConfig());

// Handle pool errors
pgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  
  // Provide helpful error messages for common issues
  if (err.message && err.message.includes('role') && err.message.includes('does not exist')) {
    console.error('\n❌ Database Connection Error:');
    console.error('   The database user does not exist.');
    console.error('   For PostgreSQL, the default user is "postgres", not "root".');
    console.error('   Please check your .env file and set:');
    console.error('   DB_USER=postgres');
    console.error('   Or use DATABASE_URL if deploying to Render/Heroku.\n');
  }
  
  // Don't exit in development, let the app handle it
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

// Create MySQL-compatible interface
// PostgreSQL uses $1, $2, $3 for parameters, MySQL uses ?
// This adapter converts MySQL-style queries to PostgreSQL
const pool = {
  async execute(query, params = []) {
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, $3
    let paramIndex = 1;
    const pgQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    
    // Check if this is an INSERT query that needs RETURNING clause
    const isInsert = query.trim().toUpperCase().startsWith('INSERT');
    let finalQuery = pgQuery;
    
    // For INSERT without RETURNING, add RETURNING id to get the inserted ID
    if (isInsert && !pgQuery.toUpperCase().includes('RETURNING')) {
      // Simple approach: append RETURNING id at the end (before semicolon if present)
      if (finalQuery.trim().endsWith(';')) {
        finalQuery = finalQuery.replace(/;$/, '') + ' RETURNING id;';
      } else {
        finalQuery = finalQuery + ' RETURNING id';
      }
    }
    
    try {
      const result = await pgPool.query(finalQuery, params);
      
      // MySQL2 returns [ResultSetHeader, fields] for INSERT
      // Where ResultSetHeader has insertId and affectedRows
      // For SELECT, it returns [rows, fields]
      
      if (isInsert) {
        // For INSERT, return [ResultSetHeader-like object, fields]
        const insertId = result.rows[0]?.id || null;
        const resultSetHeader = {
          insertId: insertId,
          affectedRows: result.rowCount || 0,
          fieldCount: result.fields?.length || 0
        };
        return [resultSetHeader, result.fields || []];
      } else {
        // For SELECT/UPDATE/DELETE, return [rows, fields]
        return [result.rows, result.fields || []];
      }
    } catch (error) {
      console.error('Database query error:', error);
      
      // Provide helpful error messages
      if (error.message && error.message.includes('role') && error.message.includes('does not exist')) {
        const helpfulError = new Error(
          'Database user does not exist. For PostgreSQL, use your system username (on macOS) or "postgres" (on Linux). ' +
          'Please check your DB_USER environment variable matches an existing PostgreSQL user.'
        );
        helpfulError.originalError = error;
        throw helpfulError;
      }
      
      throw error;
    }
  },
  
  async query(query, params = []) {
    return this.execute(query, params);
  },
  
  async end() {
    return pgPool.end();
  }
};

export default pool;
