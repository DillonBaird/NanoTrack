// Load environment variables from .env file and import required modules
require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const minifyHTML = require('express-minify-html');
const nocache = require('nocache');
const path = require('path');
const useragent = require('express-useragent');
const WebSocket = require('ws');
const { dbConnect } = require('./db');
const http = require('http');
const mongoose = require('mongoose');

// Initialize Express application and create HTTP server
const app = express();
const httpServer = http.createServer(app);

// Database Connection
dbConnect();

// Middleware Configuration
configureMiddleware(app);

// WebSocket Server Initialization and Configuration
const webSocketServer = initializeWebSocket(httpServer);

// Route Configuration
configureRoutes(app, webSocketServer);

// Error Handling Middleware
app.use(errorHandler);

// Minification
app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true
    }
}));

// Server Activation
const port = process.env.PORT || 80;
httpServer.listen(port, () => console.log(`Server is running on http://localhost:${port}`));

// Graceful Shutdown Function
function gracefulShutdown() {
    console.log("Received SIGTERM, gracefully shutting down");

    httpServer.close(() => {
        console.log("HTTP server closed");

        // Close WebSocket server
        webSocketServer.close(() => {
            console.log("WebSocket server closed");

            // Close Mongoose connection
            mongoose.connection.close(false, () => {
                console.log("MongoDB connection closed.");
                process.exit(0);
            });
        });
    });
}

// Listen for SIGTERM signal
process.on('SIGTERM', gracefulShutdown);

// Export Application and WebSocket Server
module.exports = { app, webSocketServer };

function configureMiddleware(app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(useragent.express());
    app.use(nocache());
    app.set('etag', false);
}

function initializeWebSocket(httpServer) {
    const wsServer = new WebSocket.Server({ server: httpServer });
    wsServer.on('connection', socket => {
        socket.on('message', message => console.log('WebSocket received:', message));
        socket.send('WebSocket connection established');
        socket.on('close', () => console.log('WebSocket connection closed'));
        socket.on('error', error => console.error('WebSocket error:', error));
    });
    return wsServer;
}

function configureRoutes(app, wsServer) {
    // Authentication middleware
    const isAuthenticated = (req, res, next) => {
        if (req.cookies.auth) return next();
        res.redirect('/login');
    };

    // UI and API Routes
    app.get('/', (req, res) => res.redirect(301, '/dashboard'));
    app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'ui/login.html')));
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        if (username === process.env.USERNAME && password === process.env.PASSWORD) {
            res.cookie('auth', 'true', { httpOnly: true });
            res.redirect('/dashboard');
        } else {
            res.send('Invalid credentials');
        }
    });

    app.get('/dashboard', isAuthenticated, (req, res) => {
        if (req.url.endsWith('/')) {
            res.redirect(301, req.url.slice(0, -1));
        }
        res.sendFile(path.join(__dirname, 'ui/dashboard.html'));
    });

    app.get('/campaigns', isAuthenticated, (req, res) => {
        if (req.url.endsWith('/')) {
            res.redirect(301, req.url.slice(0, -1));
        }
        res.sendFile(path.join(__dirname, 'ui/campaigns.html'));
    });

    app.get('/campaigns/:campaignId', isAuthenticated, (req, res) => {
        if (req.url.endsWith('/')) {
            res.redirect(301, req.url.slice(0, -1));
        }
        res.sendFile(path.join(__dirname, 'ui/campaign.html'));
    });

    app.get('/scripts/charts.js', (req, res) => res.sendFile(path.join(__dirname, 'ui/scripts/charts.js')));
    app.get('/scripts/navigation.js', (req, res) => res.sendFile(path.join(__dirname, 'ui/scripts/navigation.js')));
    app.get('/scripts/dataProcessing.js', (req, res) => res.sendFile(path.join(__dirname, 'ui/scripts/dataProcessing.js')));
    app.get('/scripts/filters.js', (req, res) => res.sendFile(path.join(__dirname, 'ui/scripts/filters.js')));
    app.get('/scripts/uiHelpers.js', (req, res) => res.sendFile(path.join(__dirname, 'ui/scripts/uiHelpers.js')));
    app.get('/scripts/websocket.js', (req, res) => res.sendFile(path.join(__dirname, 'ui/scripts/websocket.js')));
    app.get('/scripts/campaigns.js', (req, res) => res.sendFile(path.join(__dirname, 'ui/scripts/campaigns.js')));
    app.get('/scripts/campaign.js', (req, res) => res.sendFile(path.join(__dirname, 'ui/scripts/campaign.js')));
    app.get('/logo.png', (req, res) => res.sendFile(path.join(__dirname, 'ui/logo.png')));
    app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, 'ui/favicon.ico')));

    app.post('/logout', (req, res) => {
        res.clearCookie('auth');
        res.redirect('/login');
    });

    // Tracking routes
    const trackingRouter = require('./routes/tracking')(wsServer);
    app.use('/track', trackingRouter);
}

function errorHandler(err, req, res, next) {
    console.error('Server error:', err.stack);
    res.status(500).send('Internal Server Error');
}
