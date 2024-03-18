import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import WebSocket from 'ws';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import useragent from 'express-useragent';
import nocache from 'nocache';
// import minifyHTML from 'express-minify-html';
import { dbConnect } from './db';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
const httpServer: http.Server = http.createServer(app);

// Database Connection
dbConnect().catch((err: Error) => console.error('Database connection error:', err));

// Middleware Configuration
configureMiddleware(app);

// WebSocket Server Initialization
const webSocketServer: WebSocket.Server = new WebSocket.Server({ server: httpServer });
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
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 80;
httpServer.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

// Graceful Shutdown
process.on('SIGTERM', gracefulShutdown);

function configureMiddleware(app: Application): void {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(useragent.express());
    app.use(nocache());
    app.set('etag', false);
}

function configureWebSocketServer(wsServer: WebSocket.Server): void {
    wsServer.on('connection', (socket: WebSocket) => {
        socket.on('message', (message: WebSocket.Data) => console.log('WebSocket received:', message));
        socket.send('WebSocket connection established');
        socket.on('close', () => console.log('WebSocket connection closed'));
        socket.on('error', (error: Error) => console.error('WebSocket error:', error));
    });
}

function configureRoutes(app: Application, wsServer: WebSocket.Server): void {
    // Authentication Middleware
    app.use('/dashboard', isAuthenticated);
    app.use('/campaigns', isAuthenticated);
    app.use('/campaigns/:campaignId', isAuthenticated);

    // HTML Content Routes
    const htmlPaths: { [key: string]: string } = {
        '/': '/dashboard',
        '/login': '/ui/login.html',
        '/dashboard': '/ui/dashboard.html',
        '/campaigns': '/ui/campaigns.html',
        '/campaigns/:campaignId': '/ui/campaign.html',
    };

    // JavaScript Content Routes
    const jsPaths: { [key: string]: string } = {
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
    const imagePaths: { [key: string]: string } = {
        '/logo.png': '/ui/logo.png',
        '/favicon.ico': '/ui/favicon.ico',
        '/nanotracker.png': '/ui/nanotracker.png',
    };

    // Utility function to register static paths in Express app
    function registerStaticPaths(app: Application, paths: { [key: string]: string }): void {
        Object.keys(paths).forEach((route: string) => {
            app.get(route, (req: Request, res: Response) => sendFileOrRedirect(req, res, paths[route]));
        });
    }

    // Registering all static paths
    registerStaticPaths(app, htmlPaths);
    registerStaticPaths(app, jsPaths);
    registerStaticPaths(app, imagePaths);

    // Authentication Routes
    app.post('/login', handleLogin);
    app.post('/logout', (req: Request, res: Response) => {
        res.clearCookie('auth');
        res.redirect('/login');
    });

    // Tracking Routes
    const trackingRouter = require('./routes/tracking')(wsServer);
    app.use('/track', trackingRouter);
}

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
    if (req.cookies.auth) return next();
    res.redirect('/login');
}

// Send file or redirect if URL ends with '/'
function sendFileOrRedirect(req: Request, res: Response, filePath: string): void {
    if (req.url.endsWith('/')) {
        res.redirect(301, req.url.slice(0, -1));
    } else {
        res.sendFile(path.join(__dirname, filePath));
    }
}

// Handle login logic
function handleLogin(req: Request, res: Response): void {
    const { username, password } = req.body;
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
        res.cookie('auth', 'true', { httpOnly: true });
        res.redirect('/dashboard');
    } else {
        res.send('Invalid credentials');
    }
}

function gracefulShutdown(): void {
    console.log('Received SIGTERM, gracefully shutting down');
    httpServer.close(async () => {
        console.log('HTTP server closed');
        webSocketServer.close(() => console.log('WebSocket server closed'));
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    });
}

app.use(errorHandler);

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Server error:', err.stack);
    res.status(500).send('Internal Server Error');
}

export { app, webSocketServer };