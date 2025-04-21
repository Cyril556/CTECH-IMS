const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'C TECH IMS API is running' });
});

// Sample inventory endpoint
app.get('/api/inventory', (req, res) => {
  // This would typically fetch from a database
  res.json({
    items: [
      { id: 1, name: 'Product A', quantity: 25, status: 'in-stock' },
      { id: 2, name: 'Product B', quantity: 10, status: 'low-stock' },
      { id: 3, name: 'Product C', quantity: 0, status: 'out-of-stock' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
