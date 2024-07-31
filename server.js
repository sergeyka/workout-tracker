// server.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// API Routes
app.get('/api/exercises', async (req, res) => {
  const { day, week } = req.query;
  try {
    const result = await pool.query(`
      SELECT e.id, e.name, e.current_weight, e.notes
      FROM exercises e
      JOIN days_exercises de ON e.id = de.exercise_id
      JOIN days d ON de.day_id = d.id
      WHERE d.day_of_week = $1 AND d.week = $2
    `, [day, week]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/exercises/:id', async (req, res) => {
  const { id } = req.params;
  const { weight } = req.body;
  try {
    let query, params;
    if (weight === '' || weight === null) {
      query = 'UPDATE exercises SET current_weight = NULL WHERE id = $1';
      params = [id];
    } else {
      const weightInt = parseInt(weight, 10);
      if (isNaN(weightInt)) {
        return res.status(400).json({ error: 'Invalid weight value' });
      }
      query = 'UPDATE exercises SET current_weight = $1 WHERE id = $2';
      params = [weightInt, id];
    }
    
    await pool.query(query, params);
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});