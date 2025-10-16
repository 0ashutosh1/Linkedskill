require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/class');
const notificationRoutes = require('./routes/notification');
const profileRoutes = require('./routes/profile');
const categoryRoutes = require('./routes/category');
const subCategoryRoutes = require('./routes/subCategory');
const roleRoutes = require('./routes/role');
const connectionRoutes = require('./routes/connection');
const messageRoutes = require('./routes/message');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/classes', classRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profile', profileRoutes);
app.use('/categories', categoryRoutes);
app.use('/subcategories', subCategoryRoutes);
app.use('/roles', roleRoutes);
app.use('/connections', connectionRoutes);
app.use('/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Auth API running' });
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/?retryWrites=true&w=majority&appName=Linkedskill';

const mongoose = require('mongoose');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err.message);
    process.exit(1);
  });

module.exports = app;
