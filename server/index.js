const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/UserRoutes');
const credentialRoutes = require('./routes/CredentialsRoutes');
require('dotenv').config();

const app = express();

// Middleware.
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB.
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }).then(
  () => {
    console.log("Successfully connected to the database!");
  },
  (err) => {
    console.log("Could not connect to the database:\n" + err);
  }
);

// Routes.
app.use('/api', userRoutes);
app.use('/api', credentialRoutes);

// // Allow backend to use authenticated routes.
// app.use("/api/auth", authRoutes);

// Start server.
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
