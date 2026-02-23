require('dotenv').config();
const express = require('express');
const snippetRoutes = require('./routes/snippetRoutes');
const { pgPool, esClient } = require('./config/database');
const errorHandler = require('./middlewares/errorHandler'); // Import the global error handler
const jwt = require('jsonwebtoken');


const app = express();
app.use(express.json()); // Allows us to parse incoming JSON payloads


// --- 1. Health Check Endpoint ---
app.get('/health', async (req, res) => {
    try {
        // Ping Postgress
        const pgResult = await pgPool.query('SELECT NOW()');
        // Ping Elasticsearch
        const esResult = await esClient.cluster.health();

        res.json({
            status: 'Healthy',
            postgres_time: pgResult.rows[0].now,
            elasticsearch_status: esResult.body.status // Usually "green", "yellow", or "red"
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});



// 1. Create a Test User
app.post('/users', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pgPool.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING id, email',
      [email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Could not create user' });
  }
});

// TEMP ROUTE: Generate a token for testing
app.post('/api/auth/test-token', (req, res) => {
  const { user_id } = req.body;
  
  if (!user_id) return res.status(400).json({ error: 'Provide a user_id to generate a token' });

  // Create a token that contains the user_id and expires in 30 days
  const token = jwt.sign({ id: user_id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  res.json({ token });
});


// 3. Mount the routes
app.use('/api', snippetRoutes);

// 4. Handle undefined routes(404)
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`
  });
});
//5. Mount the global error handler (after all routes)
app.use(errorHandler);

// --- Final--> Start the Server ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  try {
    await pgPool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');
    
    await esClient.ping();
    console.log('✅ Connected to Elasticsearch');
  } catch (err) {
    console.error('❌ Database connection failed on startup:', err.message);
  }
});