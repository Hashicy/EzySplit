require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoUrl = process.env.DATABASE_URL;
if (!mongoUrl) {
  console.error('Missing DATABASE_URL environment variable for MongoDB');
  process.exit(1);
}

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});