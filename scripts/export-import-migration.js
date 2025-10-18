import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const { Pool } = pg;

// Initialize Neon connection
const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true
  }
});

// Initialize Supabase client
const supabaseUrl = 'https://hgwhbdlejogerdghkxac.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'migration-data');

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    console.log('Created migration data directory');
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function exportTable(tableName) {
  console.log(`\nExporting ${tableName}...`);
  try {
    const result = await neonPool.query(`SELECT * FROM ${tableName}`);
    const rows = result.rows;
    console.log(`Found ${rows.length} rows in ${tableName}`);

    const filePath = path.join(dataDir, `${tableName}.json`);
    await fs.writeFile(filePath, JSON.stringify(rows, null, 2));
    console.log(`Exported ${tableName} to ${filePath}`);

    return rows.length;
  } catch (e) {
    console.error(`Error exporting ${tableName}:`, e);
    throw e;
  }
}

async function createSchema() {
  console.log('\nCreating schema in Supabase...');
  try {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sortedFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/^\d+/)[0]);
        const bNum = parseInt(b.match(/^\d+/)[0]);
        return aNum - bNum;
      });

    for (const file of sortedFiles) {
      const content = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      const statements = content
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      console.log(`\nExecuting ${file}...`);
      for (const statement of statements) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`Warning executing statement from ${file}:`, error.message);
          } else {
            console.log(`Successfully executed statement from ${file}`);
          }
        } catch (err) {
          console.warn(`Warning: Statement from ${file} failed:`, err.message);
          // Continue with next statement
        }
      }
    }
  } catch (e) {
    console.error('Error creating schema:', e);
    throw e;
  }
}

async function importTable(tableName) {
  console.log(`\nImporting ${tableName}...`);
  try {
    const filePath = path.join(dataDir, `${tableName}.json`);
    const content = await fs.readFile(filePath, 'utf8');
    const rows = JSON.parse(content);

    console.log(`Found ${rows.length} rows to import for ${tableName}`);

    // Import in batches of 1000 to avoid request size limits
    const batchSize = 1000;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from(tableName).insert(batch);
      if (error) {
        console.warn(`Warning importing batch ${i / batchSize + 1} for ${tableName}:`, error.message);
      } else {
        console.log(`Imported batch ${i / batchSize + 1} of ${Math.ceil(rows.length / batchSize)} for ${tableName}`);
      }
    }

    // Verify count
    const { data, error } = await supabase.from(tableName).select('count');
    if (error) throw error;
    console.log(`Verified ${data.length} rows in ${tableName} after import`);
  } catch (e) {
    console.error(`Error importing ${tableName}:`, e);
    throw e;
  }
}

async function migrate() {
  try {
    // Test Supabase connection
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('_prisma_migrations').select('count');
    if (error && error.code !== 'PGRST205') throw error;
    console.log('Supabase connection successful');

    // Ensure data directory exists
    await ensureDataDir();

    // Define tables in order (respecting foreign keys)
    const tables = [
      'scraped_content',
      'coins',
      'rewards',
      'notifications',
      'creators',
      'comments',
      'follows',
      'referrals',
      'login_streaks'
    ];

    // Export all tables
    console.log('\nExporting tables from Neon...');
    for (const table of tables) {
      await exportTable(table);
    }

    // Create schema in Supabase
    await createSchema();

    // Import all tables
    console.log('\nImporting tables to Supabase...');
    for (const table of tables) {
      await importTable(table);
    }

    console.log('\nMigration completed successfully!');
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  } finally {
    await neonPool.end();
  }
}

migrate();