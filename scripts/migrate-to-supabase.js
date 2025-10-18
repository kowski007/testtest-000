import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Initialize Supabase client
const supabaseUrl = 'https://hgwhbdlejogerdghkxac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd2hiZGxlam9nZXJkZ2hreGFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc1MzI4NiwiZXhwIjoyMDc2MzI5Mjg2fQ.pTy3zUBuCUqZJd-tC4VXu-HYCO1SfrObTGh2eXHYY3g';
const supabase = createClient(supabaseUrl, supabaseKey);

dotenv.config();

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  let fullSchema = '';
  for (const file of sortedFiles) {
    const content = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    fullSchema += `\n-- Migration: ${file}\n${content}\n`;
  }
  return fullSchema;
}

async function migrateSchema() {
  const client = await supabaseDirectPool.connect();
  try {
    console.log('Reading migrations...');
    const schema = await readMigrations();
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log('Applying schema to Supabase...');
    console.log(`Found ${statements.length} statements to execute`);
    
    // Execute each statement
    for (const statement of statements) {
      if (!statement) continue;
      try {
        await client.query(statement);
        console.log('Successfully executed:', statement.substring(0, 50) + '...');
      } catch (err) {
        console.warn('Warning: Statement failed:', err.message);
        // Continue with next statement
      }
    }
    
    console.log('Schema creation completed');
  } catch (e) {
    console.error('Error creating schema:', e);
    throw e;
  } finally {
    client.release();
  }
}

async function migrateTableData(tableName, orderBy = 'created_at') {
  console.log(`\nMigrating ${tableName}...`);
  
  try {
    // Get data from Neon
    const result = await neonPool.query(`SELECT * FROM ${tableName} ORDER BY ${orderBy}`);
    const rows = result.rows;
    console.log(`Found ${rows.length} rows in ${tableName}`);

    if (rows.length === 0) {
      console.log(`No data to migrate for ${tableName}`);
      return;
    }

    // Insert into Supabase using direct pool connection
    const columns = Object.keys(rows[0]).join(', ');
    const values = rows.map(row => {
      const vals = Object.values(row).map(v => 
        v === null ? 'NULL' : 
        typeof v === 'object' ? `'${JSON.stringify(v)}'` :
        `'${String(v).replace(/'/g, "''")}'`
      ).join(', ');
      return `(${vals})`;
    }).join(',\n');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES ${values};`;
    await supabaseDirectPool.query(query);
    
    // Verify count
    const { rows: [{ count }] } = await supabaseDirectPool.query(`SELECT COUNT(*) FROM ${tableName}`);
    console.log(`Verified ${count} rows in ${tableName} after migration`);
  } catch (e) {
    console.error(`Error migrating ${tableName}:`, e);
    throw e;
  }
}

async function testConnection() {
  // Skip Neon connection test for now since we're having network issues
  console.log('Testing Supabase connection...');
  try {
    const result = await supabaseDirectPool.query('SELECT version()');
    console.log('Supabase connection successful:', result.rows[0].version);
  } catch (e) {
    console.error('Supabase connection failed:', e);
    throw e;
  }
}

async function migrate() {
  try {
    console.log('Testing connections first...');
    await testConnection();

    console.log('\nStarting migration...');
    await migrateSchema();

    // Migrate tables in order (respecting foreign keys)
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

    for (const table of tables) {
      await migrateTableData(table);
    }

    console.log('\nMigration completed successfully!');
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  } finally {
    await neonPool.end();
    await supabaseDirectPool.end();
  }
}

migrate();