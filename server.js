require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const playersRouter = require('./routes/players');
app.use('/api/players', playersRouter);

const port = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (err) => console.error(err));
db.once('open', () => console.log('Connect to DB!'));

app.listen(port, () => console.log(`Server running on port ${port}.`));
