require('dotenv').config();
const { Pool } = require('pg');
const { Client } = require('@elastic/elasticsearch');

// Connect to PostgreSQL
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Connect to Elasticsearch (v7)
const esClient = new Client({ 
  node: process.env.ELASTICSEARCH_URL 
});

async function initializeDatabases() {
  console.log('Starting database initialization...');

  try {
    // ==========================================
    // 1. POSTGRESQL SETUP (The Source of Truth)
    // ==========================================
    console.log('Creating PostgreSQL tables...');
    
    // Create Users Table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Snippets Table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS snippets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        code_content TEXT NOT NULL,
        language VARCHAR(50),
        source_url VARCHAR(2048),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ PostgreSQL tables created successfully.');

    // ==========================================
    // 2. ELASTICSEARCH SETUP (The Search Engine)
    // ==========================================
    const indexName = 'snippets_index';
    
    // Check if index already exists to avoid errors
    const { body: indexExists } = await esClient.indices.exists({ index: indexName });
    
    if (indexExists) {
      console.log(`ℹ️  Elasticsearch index '${indexName}' already exists. Skipping creation.`);
    } else {
      console.log('Creating Elasticsearch index and mapping...');
      
      await esClient.indices.create({
        index: indexName,
        body: {
          // The Mapping defines how Elastic searches our data
          mappings: {
            properties: {
              snippet_id: { type: 'keyword' }, // keyword = exact match only (we don't fuzzy search UUIDs)
              user_id: { type: 'keyword' },    
              title: { type: 'text' },         // text = fuzzy searchable
              code_content: { type: 'text' },  // text = fuzzy searchable
              language: { type: 'keyword' }    // keyword = exact match (e.g., filter only "bash" scripts)
            }
          }
        }
      });
      console.log('✅ Elasticsearch index and mapping created successfully.');
    }

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Error during initialization:', error);
  } finally {
    // Close connections so the script can exit
    await pgPool.end();
    await esClient.close();
  }
}

initializeDatabases();