import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configure Supabase connection with direct connection string
const pool = new Pool({
  connectionString: `postgresql://postgres:dJDoqlH91IZvvEVH@db.hgwhbdlejogerdghkxac.supabase.co:5432/postgres?sslmode=require`,
});

async function readMigrations() {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = await fs.readdir(migrationsDir);
  const sortedFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/^\d+/)[0]);
      const bNum = parseInt(b.match(/^\d+/)[0]);
      return aNum - bNum;
    });

  let allStatements = [];
  for (const file of sortedFiles) {
    console.log(`Reading migration file: ${file}`);
    const content = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    
    // Split content into individual SQL statements
    const statements = content
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    allStatements.push(...statements);
  }
  
  return allStatements;
}

async function setupSchema() {
  // Get a client from the pool
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');

    console.log('Reading migration files...');
    const statements = await readMigrations();
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('Successfully executed statement:', statement.substring(0, 50) + '...');
      } catch (err) {
        console.warn('Statement execution failed:', err.message);
        console.warn('Failed statement:', statement);
        // Continue with next statement
      }
    }

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Schema setup completed successfully');
    
  } catch (e) {
    // Rollback the transaction on error
    await client.query('ROLLBACK');
    console.error('Schema setup failed:', e);
    process.exit(1);
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Run the schema setup
setupSchema();