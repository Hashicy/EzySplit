const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// If deployed behind a proxy (Render), trust it so secure cookies work
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.get('/', (req, res) => res.send('EzySplit API is running'));
app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

module.exports = app;