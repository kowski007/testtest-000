import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
  try {
    console.log('Reading migration files...');
    const statements = await readMigrations();
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (const statement of statements) {
      try {
        // Execute each statement using Supabase's RPC
        const { data, error } = await supabase.rpc('execute_sql', {
          sql_statement: statement
        });

        if (error) {
          console.warn('Warning executing statement:', error.message);
          console.warn('Failed statement:', statement);
          // Continue with next statement
          continue;
        }

        console.log('Successfully executed statement');
      } catch (err) {
        console.warn('Statement execution failed:', err.message);
        // Continue with next statement
      }
    }
    
    console.log('Schema setup completed');
  } catch (e) {
    console.error('Schema setup failed:', e);
    process.exit(1);
  }
}

// Run the schema setup
setupSchema();