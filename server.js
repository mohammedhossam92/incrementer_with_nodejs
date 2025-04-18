const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Data file path
const dataFilePath = path.join(__dirname, 'data.json');

// Initialize data if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
  const initialData = {
    categories: ['Default'],
    counters: {
      'Default': {
        value: 0,
        lastUpdated: new Date().toISOString(),
        addedToday: 0
      }
    }
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
}

// Get all data
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFilePath));
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Add new category
app.post('/api/categories', (req, res) => {
  try {
    const { category } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFilePath));
    
    if (data.categories.includes(category)) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    data.categories.push(category);
    data.counters[category] = {
      value: 0,
      lastUpdated: new Date().toISOString(),
      addedToday: 0
    };
    
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// Delete category
app.delete('/api/categories/:category', (req, res) => {
  try {
    const { category } = req.params;
    const data = JSON.parse(fs.readFileSync(dataFilePath));
    
    if (category === 'Default') {
      return res.status(400).json({ error: 'Cannot delete Default category' });
    }
    
    const index = data.categories.indexOf(category);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    data.categories.splice(index, 1);
    delete data.counters[category];
    
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Update counter
app.put('/api/counters/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { action } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFilePath));
    
    if (!data.counters[category]) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const counter = data.counters[category];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const lastUpdatedDate = new Date(counter.lastUpdated);
    const lastUpdatedDay = new Date(lastUpdatedDate.getFullYear(), lastUpdatedDate.getMonth(), lastUpdatedDate.getDate()).toISOString();
    
    // Reset addedToday if it's a new day
    if (lastUpdatedDay !== today) {
      counter.addedToday = 0;
    }
    
    // Update counter based on action
    switch (action) {
      case 'increment':
        counter.value += 1;
        counter.addedToday += 1;
        break;
      case 'incrementHalf':
        counter.value += 0.5;
        counter.addedToday += 0.5;
        break;
      case 'decrement':
        counter.value -= 1;
        counter.addedToday -= 1;
        break;
      case 'decrementHalf':
        counter.value -= 0.5;
        counter.addedToday -= 0.5;
        break;
      case 'reset':
        counter.value = 0;
        counter.addedToday = 0;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    counter.lastUpdated = now.toISOString();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Error updating counter:', error);
    res.status(500).json({ error: 'Failed to update counter' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});