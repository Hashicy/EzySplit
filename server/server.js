require('dotenv').config();
const app = require('./app');

PORT=4000
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});