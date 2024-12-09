const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;

// Mock user data (In real-world scenarios, use a database)
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10), // Password is hashed
    role: 'admin',
  },
  {
    id: 2,
    username: 'user',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
  },
];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).send('Access denied');

  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

// Middleware for role-based authorization
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
};

// Body parser middleware
app.use(bodyParser.json());

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).send('User not found');

  // Check password
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) return res.status(400).send('Invalid credentials');

  // Generate JWT
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'secretKey');
  res.json({ token });
});

// Admin route (protected)
app.get('/admin', authenticateToken, authorizeRole(['admin']), (req, res) => {
  res.send('Welcome Admin');
});

// User route (protected)
app.get('/user', authenticateToken, authorizeRole(['admin', 'user']), (req, res) => {
  res.send('Welcome User');
});

// Guest route (protected)
app.get('/guest', authenticateToken, authorizeRole(['admin', 'user', 'guest']), (req, res) => {
  res.send('Welcome Guest');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
