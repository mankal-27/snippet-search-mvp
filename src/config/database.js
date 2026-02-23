const { Pool } = require('pg');
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const esClient = new Client({ 
  node: process.env.ELASTICSEARCH_URL 
});

module.exports = { pgPool, esClient };