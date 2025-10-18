import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase API configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

  let tables = [];
  
  for (const file of sortedFiles) {
    console.log(`Reading migration file: ${file}`);
    const content = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    
    // Extract CREATE TABLE statements
    const createTableMatches = content.match(/CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\)/g);
    if (createTableMatches) {
      for (const statement of createTableMatches) {
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
        const columnsString = statement.match(/\(([\s\S]*?)\)/)[1];
        
        // Parse columns
        const columns = columnsString
          .split(',')
          .map(col => col.trim())
          .filter(col => col.length > 0)
          .map(col => {
            const parts = col.split(/\s+/);
            return {
              name: parts[0],
              type: parts[1],
              constraints: parts.slice(2).join(' ')
            };
          });
        
        tables.push({
          name: tableName,
          columns
        });
      }
    }
  }
  
  return tables;
}

async function createTable(table) {
  const url = `${supabaseUrl}/rest/v1/${table.name}`;
  
  // Convert columns to Supabase POST API format
  const columnDefs = {};
  for (const col of table.columns) {
    columnDefs[col.name] = {
      type: col.type.toLowerCase(),
      nullable: !col.constraints.includes('NOT NULL')
    };
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name: table.name,
        columns: columnDefs
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create table ${table.name}: ${error.message || response.statusText}`);
    }

    console.log(`Successfully created table: ${table.name}`);
  } catch (error) {
    console.warn(`Warning creating table ${table.name}:`, error.message);
  }
}

async function setupSchema() {
  try {
    console.log('Reading migration files...');
    const tables = await readMigrations();
    console.log(`Found ${tables.length} tables to create`);
    
    for (const table of tables) {
      await createTable(table);
    }
    
    console.log('Schema setup completed');
  } catch (e) {
    console.error('Schema setup failed:', e);
    process.exit(1);
  }
}

// Run the schema setup
setupSchema();