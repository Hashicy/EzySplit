const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');

const app = express();

// If deployed behind a proxy (Render), trust it so secure cookies work
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());
// Normalize origins by removing trailing slashes for robust matching
const normalizeOrigin = (u) => (typeof u === 'string' ? u.replace(/\/+$/, '') : u);
const allowedOrigin = normalizeOrigin(process.env.CLIENT_URL);

app.use(cors({
  origin: (incomingOrigin, callback) => {
    // allow non-browser requests (e.g., server-to-server) when no origin
    if (!incomingOrigin) return callback(null, true);
    if (normalizeOrigin(incomingOrigin) === allowedOrigin) return callback(null, true);
    // not allowed
    return callback(new Error('CORS origin not allowed'), false);
  },
  credentials: true
}));

app.get('/', (req, res) => res.send('EzySplit API is running'));
app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

module.exports = app;