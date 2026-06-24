const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet } = require('../db/connection');
const { JWT_SECRET } = require('../config/constants');

const router = express.Router();

// Register Endpoint
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contrasena son requeridos.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3 || password.length < 4) {
    return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres y la contrasena al menos 4.' });
  }

  try {
    // Check if user exists
    const existingUser = await dbGet('SELECT id FROM users WHERE username = ?', [cleanUsername]);
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya esta registrado.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    await dbRun(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [cleanUsername, passwordHash]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contrasena son requeridos.' });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const user = await dbGet('SELECT * FROM users WHERE username = ?', [cleanUsername]);
    if (!user) {
      return res.status(400).json({ error: 'Usuario o contrasena incorrectos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Usuario o contrasena incorrectos.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = { router };
