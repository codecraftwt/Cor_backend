const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/AiRoutes');
const cors = require('cors');
const AccountRoutes = require('./routes/AccountRoutes');
require('dotenv').config();

const app = express();

connectDB();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', userRoutes);
app.use('/api', aiRoutes);
app.use('/api/accounts', AccountRoutes);
app.get("/", (req, res) => {
  res.send("App works properly!");
});

module.exports = app;
