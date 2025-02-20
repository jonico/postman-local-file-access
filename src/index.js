require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs').promises;
const { authMiddleware } = require('./middleware/auth');
const filesRouter = require('./routes/files');
const directoriesRouter = require('./routes/directories');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
fs.mkdir(dataDir, { recursive: true })
  .then(() => {
    console.log('Data directory is ready');
  })
  .catch(err => {
    console.error('Error creating data directory:', err);
    process.exit(1);
  });

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/files', authMiddleware, filesRouter);
app.use('/api/directories', authMiddleware, directoriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 