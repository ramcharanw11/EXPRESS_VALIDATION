const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper function to read users from file
function readUsers() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write users to file
function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// Routes

// GET - Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = readUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Get a single user by ID
app.get('/api/users/:id', (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Create a new user (Registration)
app.post('/api/users', (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, dateOfBirth } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'First name, last name, and email are required' 
      });
    }
    
    // Check if email already exists
    const users = readUsers();
    const emailExists = users.some(u => u.email === email);
    
    if (emailExists) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      phone: phone || '',
      address: address || '',
      dateOfBirth: dateOfBirth || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT - Update a user
app.put('/api/users/:id', (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, dateOfBirth } = req.body;
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === email && u.id !== req.params.id);
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email already registered' 
        });
      }
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      email: email || users[userIndex].email,
      phone: phone !== undefined ? phone : users[userIndex].phone,
      address: address !== undefined ? address : users[userIndex].address,
      dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : users[userIndex].dateOfBirth,
      updatedAt: new Date().toISOString()
    };
    
    writeUsers(users);
    res.json({ success: true, data: users[userIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Delete a user
app.delete('/api/users/:id', (req, res) => {
  try {
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    writeUsers(users);
    
    res.json({ success: true, data: deletedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
    console.error(`You can kill the process using: lsof -ti:${PORT} | xargs kill -9`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
