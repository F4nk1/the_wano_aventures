const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/constants');
const { initDb } = require('./db/init');
const { router: authRouter } = require('./auth/routes');
const { initSockets } = require('./sockets/index');

const app = express();
app.use(cors());
app.use(express.json());

// API Auth Routes
app.use('/api/auth', authRouter);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor del Monopolio V2.1.' });
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket listeners
initSockets(io);

// Start server
server.listen(PORT, async () => {
  console.log(`Servidor de Monopolio V2.1 en puerto ${PORT}`);
  await initDb();
});
