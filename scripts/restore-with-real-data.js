const { Client } = require('pg');
const fs = require('fs');

async function restoreWithRealData() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    await client.connect();
    console.log('Restoring complete database with schema and real data...');
    
    // Clear existing database
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('Cleared existing schema');
    
    // Step 1: Create tables from schema-only file
    console.log('\nStep 1: Creating tables...');
    const schemaContent = fs.readFileSync('backup_schema_only.sql', 'utf8');
    
    // Extract CREATE TABLE statements
    const createTableRegex = /CREATE TABLE public\.(\w+) \(([\s\S]*?)\n\);/g;
    const tableMatches = [...schemaContent.matchAll(createTableRegex)];
    
    for (const match of tableMatches) {
      const tableName = match[1];
      const tableDef = match[2];
      const fullCreateStatement = `CREATE TABLE public.${tableName} (${tableDef}\n);`;
      
      try {
        await client.query(fullCreateStatement);
        console.log(`Created ${tableName} table`);
      } catch (error) {
        console.log(`Error creating ${tableName}: ${error.message}`);
      }
    }
    
    // Step 2: Insert data from data-only file
    console.log('\nStep 2: Inserting real data...');
    const dataContent = fs.readFileSync('backup_data_only.sql', 'utf8');
    
    // Process each COPY section
    const copySections = dataContent.split('COPY public.');
    
    for (let i = 1; i < copySections.length; i++) {
      const section = copySections[i];
      const lines = section.split('\n');
      
      if (lines.length > 0) {
        // Extract table name and columns from first line
        const firstLine = lines[0];
        const tableMatch = firstLine.match(/(\w+) \(([^)]+)\) FROM stdin;/);
        
        if (tableMatch) {
          const tableName = tableMatch[1];
          const columns = tableMatch[2];
          
          console.log(`Processing data for ${tableName}...`);
          
          // Process data rows
          let insertCount = 0;
          for (let j = 1; j < lines.length; j++) {
            const line = lines[j].trim();
            
            // Stop at end of data section
            if (line === '\\.' || line === '' || line.startsWith('--')) {
              break;
            }
            
            // Parse tab-separated values
            const values = line.split('\t');
            
            // Build INSERT statement
            let insertStatement = `INSERT INTO public.${tableName} (${columns}) VALUES (`;
            
            const quotedValues = values.map(val => {
              if (val === '\\N' || val === '') return 'NULL';
              // Handle special characters and quotes
              let cleanVal = val.replace(/'/g, "''");
              return `'${cleanVal}'`;
            });
            
            insertStatement += quotedValues.join(', ') + ');';
            
            try {
              await client.query(insertStatement);
              insertCount++;
            } catch (error) {
              console.log(`Error inserting row: ${error.message}`);
            }
          }
          
          console.log(`Inserted ${insertCount} rows into ${tableName}`);
        }
      }
    }
    
    // Step 3: Add primary keys and constraints
    console.log('\nStep 3: Adding primary keys...');
    
    // Add primary keys
    await client.query('ALTER TABLE public.candidates ADD PRIMARY KEY (id);');
    await client.query('ALTER TABLE public.voters ADD PRIMARY KEY (id);');
    await client.query('ALTER TABLE public.votes ADD PRIMARY KEY (id);');
    await client.query('ALTER TABLE public.voting_session ADD PRIMARY KEY (id);');
    
    // Add unique constraints
    try {
      await client.query('ALTER TABLE public.candidates ADD UNIQUE (email);');
      await client.query('ALTER TABLE public.candidates ADD UNIQUE (phone);');
    } catch (error) {
      console.log('Unique constraints already exist or failed');
    }
    
    // Step 4: Add indexes
    console.log('\nStep 4: Adding indexes...');
    const indexes = [
      'CREATE INDEX idx_candidates_category ON public.candidates(category);',
      'CREATE INDEX idx_candidates_status ON public.candidates(status);',
      'CREATE INDEX idx_voters_email ON public.voters(email);',
      'CREATE INDEX idx_voters_phone ON public.voters(phone);',
      'CREATE INDEX idx_voters_nic ON public.voters(nic);',
      'CREATE INDEX idx_votes_candidateid ON public.votes(candidateid);',
      'CREATE INDEX idx_votes_category ON public.votes(category);',
      'CREATE INDEX idx_votes_timestamp ON public.votes("timestamp");',
      'CREATE INDEX idx_votes_voterid ON public.votes(voterid);'
    ];
    
    for (const index of indexes) {
      try {
        await client.query(index);
        console.log('Added index');
      } catch (error) {
        console.log(`Index failed: ${error.message}`);
      }
    }
    
    // Step 5: Verify data
    console.log('\nStep 5: Verifying data...');
    const tables = ['candidates', 'voters', 'votes', 'voting_session'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM public.${table}`);
        console.log(`${table}: ${result.rows[0].count} rows`);
        
        // Show sample data
        if (result.rows[0].count > 0) {
          const sampleResult = await client.query(`SELECT * FROM public.${table} LIMIT 2`);
          console.log(`Sample data from ${table}:`);
          sampleResult.rows.forEach((row, index) => {
            console.log(`  Row ${index + 1}: ${JSON.stringify(row, null, 2)}`);
          });
        }
      } catch (error) {
        console.log(`Could not verify ${table}: ${error.message}`);
      }
    }
    
    console.log('\nDatabase restoration with real data completed successfully!');
    
  } catch (error) {
    console.error('Database restoration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

restoreWithRealData();
