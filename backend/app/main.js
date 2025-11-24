// Main Express Application Entry Point
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const config = require('./core/config');
const { initializeDatabase } = require('./database');

// Import routers
const contactFieldsRouter = require('./routers/contact_fields');
const contactsRouter = require('./routers/contacts');
const projectsRouter = require('./routers/projects');
const tasksRouter = require('./routers/tasks');
const activitiesRouter = require('./routers/activities');
const documentsRouter = require('./routers/documents');
const boardsRouter = require('./routers/boards');
const usersRouter = require('./routers/users');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
initializeDatabase();

// API Routes
app.use('/api/v1/contact-fields', contactFieldsRouter);
app.use('/api/v1/contacts', contactsRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/activities', activitiesRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/boards', boardsRouter);
app.use('/api/v1/users', usersRouter);

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Serve HTML pages (before static files to override default index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'login.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'index.html'));
});

app.get('/boards', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'boards.html'));
});

app.get('/boards.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'boards.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'register.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'settings.html'));
});

app.get('/contacts/new', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'contact-new.html'));
});

app.get('/clients/new', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'client-new.html'));
});

app.get('/clients', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'clients-list.html'));
});

app.get('/clients/:id', (req, res) => {
    res.sendFile(path.join(frontendPath, 'app', 'client-detail.html'));
});

// Start server
app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}`);
    console.log(`API available at http://localhost:${config.PORT}/api/v1/`);
});

module.exports = app;

