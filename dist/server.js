"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const ws_1 = __importDefault(require("ws"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_useragent_1 = __importDefault(require("express-useragent"));
const nocache_1 = __importDefault(require("nocache"));
// import minifyHTML from 'express-minify-html';
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const httpServer = http_1.default.createServer(app);
// Database Connection
(0, db_1.dbConnect)().catch((err) => console.error('Database connection error:', err));
// Middleware Configuration
configureMiddleware(app);
// WebSocket Server Initialization
const webSocketServer = new ws_1.default.Server({ server: httpServer });
exports.webSocketServer = webSocketServer;
configureWebSocketServer(webSocketServer);
// Route Configuration
configureRoutes(app, webSocketServer);
// HTML Minification
// app.use(
//     minifyHTML({
//         override: true,
//         exception_url: false,
//         htmlMinifier: {
//             removeComments: true,
//             collapseWhitespace: true,
//             collapseBooleanAttributes: true,
//             removeAttributeQuotes: true,
//             removeEmptyAttributes: true,
//             minifyJS: true,
//         },
//     })
// );
// Server Activation
const PORT = process.env.PORT ? Number(process.env.PORT) : 80;
httpServer.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
// Graceful Shutdown
process.on('SIGTERM', gracefulShutdown);
function configureMiddleware(app) {
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_useragent_1.default.express());
    app.use((0, nocache_1.default)());
    app.set('etag', false);
}
function configureWebSocketServer(wsServer) {
    wsServer.on('connection', (socket) => {
        socket.on('message', (message) => console.log('WebSocket received:', message));
        socket.send('WebSocket connection established');
        socket.on('close', () => console.log('WebSocket connection closed'));
        socket.on('error', (error) => console.error('WebSocket error:', error));
    });
}
function configureRoutes(app, wsServer) {
    // Authentication Middleware
    app.use('/dashboard', isAuthenticated);
    app.use('/campaigns', isAuthenticated);
    app.use('/campaigns/:campaignId', isAuthenticated);
    // HTML Content Routes
    const htmlPaths = {
        '/': '/dashboard',
        '/login': '/ui/login.html',
        '/dashboard': '/ui/dashboard.html',
        '/campaigns': '/ui/campaigns.html',
        '/campaigns/:campaignId': '/ui/campaign.html',
    };
    // JavaScript Content Routes
    const jsPaths = {
        '/scripts/charts.js': '/ui/scripts/charts.js',
        '/scripts/navigation.js': '/ui/scripts/navigation.js',
        '/scripts/dataProcessing.js': '/ui/scripts/dataProcessing.js',
        '/scripts/filters.js': '/ui/scripts/filters.js',
        '/scripts/uiHelpers.js': '/ui/scripts/uiHelpers.js',
        '/scripts/websocket.js': '/ui/scripts/websocket.js',
        '/scripts/campaigns.js': '/ui/scripts/campaigns.js',
        '/scripts/campaign.js': '/ui/scripts/campaign.js',
    };
    // Image Content Routes
    const imagePaths = {
        '/logo.png': '/ui/logo.png',
        '/favicon.ico': '/ui/favicon.ico',
        '/nanotracker.png': '/ui/nanotracker.png',
    };
    // Utility function to register static paths in Express app
    function registerStaticPaths(app, paths) {
        Object.keys(paths).forEach((route) => {
            app.get(route, (req, res) => sendFileOrRedirect(req, res, paths[route]));
        });
    }
    // Registering all static paths
    registerStaticPaths(app, htmlPaths);
    registerStaticPaths(app, jsPaths);
    registerStaticPaths(app, imagePaths);
    // Authentication Routes
    app.post('/login', handleLogin);
    app.post('/logout', (req, res) => {
        res.clearCookie('auth');
        res.redirect('/login');
    });
    // Tracking Routes
    const trackingRouter = require('./routes/tracking')(wsServer);
    app.use('/track', trackingRouter);
}
// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.auth)
        return next();
    res.redirect('/login');
}
// Send file or redirect if URL ends with '/'
function sendFileOrRedirect(req, res, filePath) {
    if (req.url.endsWith('/')) {
        res.redirect(301, req.url.slice(0, -1));
    }
    else {
        res.sendFile(path_1.default.join(__dirname, filePath));
    }
}
// Handle login logic
function handleLogin(req, res) {
    const { username, password } = req.body;
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
        res.cookie('auth', 'true', { httpOnly: true });
        res.redirect('/dashboard');
    }
    else {
        res.send('Invalid credentials');
    }
}
function gracefulShutdown() {
    console.log('Received SIGTERM, gracefully shutting down');
    httpServer.close(async () => {
        console.log('HTTP server closed');
        webSocketServer.close(() => console.log('WebSocket server closed'));
        await mongoose_1.default.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    });
}
app.use(errorHandler);
function errorHandler(err, req, res, next) {
    console.error('Server error:', err.stack);
    res.status(500).send('Internal Server Error');
}
