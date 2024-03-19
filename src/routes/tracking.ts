import express = require('express');
import { Request, Response, Router } from 'express';
import { Document } from 'mongoose';
import * as geoip from 'geoip-lite';
import TrackingData from '../models/TrackingData';
import * as WebSocket from 'ws';

export default function (wss: WebSocket.Server): Router {
    const router = express.Router();

    interface Geo {
        ip: string;
        city: string;
        country: string;
    }

    // Endpoint to retrieve paginated tracking data
    router.get('/api/tracking-data', isAuthenticated, async (req: Request, res: Response) => {
        try {
            const page: number = parseInt(req.query.page as string, 10) || 1;
            const limit: number = parseInt(req.query.limit as string, 10) || 10;
            const skip: number = (page - 1) * limit;
            const data = await TrackingData.find({});
            const total: number = data.length;
            const paginatedData = data.reverse().slice(skip, skip + limit);

            res.json({
                total,
                page,
                pages: Math.ceil(total / limit),
                data: paginatedData
            });
        } catch (err) {
            console.error('Error fetching tracking data:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    // Endpoint to retrieve data for charts
    router.get('/api/chart-data', isAuthenticated, async (req: Request, res: Response) => {
        try {
            const allTrackingData = await TrackingData.find({});
            const pathCounts: { [key: string]: { [key: string]: number } } = {};
            const ipCounts: { [key: string]: { [key: string]: number } } = {};
            const campaignCounts: { [key: string]: { [key: string]: number } } = {};

            allTrackingData.forEach(item => {
                const { path = 'Unknown', decay, geo = {} as Geo, campaignID = 'Unknown' } = item;
                const date = new Date(decay).toLocaleDateString();
                const ip = geo.ip || 'Unknown';

                incrementCounts(pathCounts, path, date);
                incrementCounts(ipCounts, ip);
                incrementCounts(campaignCounts, campaignID);
            });

            res.json(reshapeChartData(pathCounts, ipCounts, campaignCounts));
        } catch (err) {
            console.error('Error fetching chart data:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    // Endpoint to retrieve campaign-specific data
    router.get('/api/campaign/:campaignId', isAuthenticated, async (req: Request, res: Response) => {
        try {
            const { campaignId } = req.params;
            const campaignData = await TrackingData.find({ campaignID: campaignId });

            if (!campaignData.length) {
                return res.status(404).json({ message: "Campaign not found" });
            }

            res.json(campaignData);
        } catch (err) {
            console.error('Error fetching campaign data:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    // Endpoint to delete a specific campaign
    router.delete('/api/campaign/:campaignID', isAuthenticated, async (req: Request, res: Response) => {
        try {
            const { campaignID } = req.params;
            await TrackingData.deleteMany({ campaignID } as unknown as string);
            res.status(200).json({ message: 'Campaign deleted successfully' });
        } catch (err) {
            console.error('Error deleting campaign:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    // Default route to handle all other requests
    router.all('*', async (req: Request, res: Response) => {
        try {
            let trackingData;

            // Check if the request is POST and handle form data
            if (req.method === 'POST') {
                trackingData = await saveAndBroadcastTrackingData(req, wss, req.body);
            } else {
                trackingData = await saveAndBroadcastTrackingData(req, wss);
            }

            // Handle redirection or file download based on the tracking data
            if (trackingData.params.redirectUrl) {
                return res.redirect(trackingData.params.redirectUrl as string);
            } else if (trackingData.params.fileDownloadPath) {
                return res.redirect(trackingData.params.fileDownloadPath as string);
            } else {
                handleTrackingResponse(req, res, trackingData);
            }
        } catch (err) {
            console.error('Error in tracking route:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    return router;
};

// Helper Functions

function isRemoteUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
}

function getFilenameFromUrl(url: string): string {
    return url.split('/').pop() || '';
}

// Middleware to validate campaignID in the request
const validateCampaignID = (req: Request, res: Response, next: Function) => {
    const { campaignID } = req.query;
    if (!campaignID) {
        return res.status(400).json({ error: 'Missing campaignID' });
    }
    next();
};

const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.cookies.auth) return next();
    res.redirect('/login');
};


/**
 * Increments count values for given keys in a data structure.
 * @param {Object} counts - The counts object to be incremented.
 * @param {String} key - The primary key.
 * @param {String} [subKey] - The optional sub-key.
 */
function incrementCounts(counts: { [key: string]: { [key: string]: number } | number }, key: string, subKey: string | null = null) {
    if (subKey) {
        // Ensure the nested structure exists
        if (typeof counts[key] !== 'object') {
            counts[key] = {};
        }

        // Now TypeScript knows counts[key] is an object due to the above check
        const subCounts = counts[key] as { [key: string]: number };

        // Increment the count for the subKey
        subCounts[subKey] = (subCounts[subKey] || 0) + 1;
    } else {
        // When there's no subKey, work directly with counts[key] as a number
        // This requires telling TypeScript counts[key] can be a number in this case
        if (typeof counts[key] === 'object') {
            // Handle error or convert object to number if it makes sense in your context
            console.error('Expected a number, found an object. This key should not have subkeys.');
            return;
        }

        // Increment or initialize the count for the key
        counts[key] = (counts[key] as number || 0) + 1;
    }
}


/**
 * Reshapes data for chart outputs.
 * @param {Object} pathCounts - Counts of paths.
 * @param {Object} ipCounts - Counts of IPs.
 * @param {Object} campaignCounts - Counts of campaign IDs.
 * @returns {Object} - Reshaped data for charting.
 */
function reshapeChartData(pathCounts: { [key: string]: { [key: string]: number } }, ipCounts: { [key: string]: { [key: string]: number } }, campaignCounts: { [key: string]: { [key: string]: number } }) {
    return {
        pathCounts: reshapeData(pathCounts),
        ipCounts: reshapeData(ipCounts, 'ip'),
        campaignCounts: reshapeData(campaignCounts, 'campaignID')
    };
}

/**
 * Transforms count data into a suitable format for charting.
 * @param {Object} data - The data to reshape.
 * @param {String} [keyName='path'] - The key name for the reshaped data.
 * @returns {Array} - An array of data suitable for charting.
 */
function reshapeData(data: { [key: string]: { [key: string]: number } }, keyName: string = 'path') {
    return Object.keys(data).map(key => ({
        [keyName]: key,
        counts: Object.entries(data[key]).map(([date, count]) => ({ date, count }))
    }));
}

/**
 * Saves tracking data and broadcasts it to connected WebSocket clients.
 * @param {Object} req - The HTTP request object.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 * @returns {Promise<Object>} - The saved tracking data.
 */
async function saveAndBroadcastTrackingData(req: Request, wss: WebSocket.Server, formData: any = null) {
    const geo = geoip.lookup(req.ip as string) || {} as any;
    let requestIP = req.ip;

    if (process.env.ANONYMIZE_IPS === 'true') {
        requestIP = '';
        geo.ip = requestIP;
    }

    const trackingInfo = {
        host: req.get('host'),
        referrer: req.get('referrer') || '',
        params: req.query,
        path: req.path,
        decay: Date.now(),
        useragent: {
            browser: req.useragent?.browser,
            version: req.useragent?.version,
            device: req.useragent?.isMobile ? 'mobile' : 'desktop',
            os: req.useragent?.os,
        },
        language: req.acceptsLanguages(),
        geo: {
            ip: requestIP,
            ...geo
        },
        domain: req.hostname,
        timestamp: new Date().toISOString(),
        acceptHeaders: req.headers['accept'],
        dnt: req.headers['dnt'],
        httpVersion: req.httpVersion
    };
    const trackingData = { ...trackingInfo, campaignID: req.query.campaignID };

    if (formData) {
        trackingData.params = formData;
    }

    if (req.headers['dnt'] !== '1') {
        // @ts-expect-error TS2345
        await TrackingData.save(trackingData);

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(trackingData));
            }
        });
    }

    return trackingData;
}

/**
 * Handles the tracking response based on the request type.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Object} trackingData - The tracking data.
 */
function handleTrackingResponse(req: Request, res: Response, trackingData: any) {
    if (req.path === '/click.gif' && req.query.redirectURL) {
        return res.redirect(req.query.redirectURL as string);
    }

    if (!req.get('referrer')) {
        res.send(generateTrackingUI(trackingData));
    } else {
        const pixel = Buffer.from(
            'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
            'base64'
        );
        res.setHeader('Content-Type', 'image/gif');
        res.setHeader('Content-Length', pixel.length.toString());
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.end(pixel);
    }
}

/**
 * Generates readable tracking data from a JSON object.
 * This function converts each key-value pair in the tracking data object
 * into a formatted HTML string, improving the readability of the data.
 * Nested objects are handled recursively to maintain the structure and readability.
 * @param {Object} trackingData - The tracking data object.
 * @returns {String} - The HTML string representing the tracking data.
 */
function generateReadableTrackingData(trackingData: any, indentLevel: number = 0): string {
    return Object.entries(trackingData).map(([key, value]) => {
        const indent = '&nbsp;'.repeat(indentLevel * 4); // 4 spaces per indent level
        if (typeof value === 'object' && value !== null) {
            const nestedHtml = generateReadableTrackingData(value, indentLevel + 1);
            return `${indent}<strong>${key}:</strong><br>${nestedHtml}`;
        } else {
            return `${indent}<strong>${key}:</strong> ${value}<br>`;
        }
    }).join('');
}


/**
 * Generates the tracking user interface.
 * @param {Object} trackingData - The tracking data.
 * @returns {String} - The HTML content for the tracking UI.
 */
function generateTrackingUI(trackingData: any): string {
    const readableTrackingData = generateReadableTrackingData(trackingData);
    const headContent = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NanoTrack Transparency Page</title>
    `;

    const styles = `
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
                background-color: #f4f4f4;
                color: #333;
                text-align: center;
                max-width: 80%;
            }
            h1 { margin-top: 20px; color: #007bff; }
            .tracking-data {
                background-color: #fff;
                border: 1px solid #ddd;
                padding: 15px;
                margin: 50px auto;
                width: 80%;
                text-align: left;
            }
            img { width: 150px; margin-top: 50px; }
            p { margin-bottom: 1em; }
            .infoBlock {
                max-width: 80%;
                margin: 0 auto;
                font-size: .8rem;
                opacity: .9;
                text-align: left;
            }
            hr { margin: 50px 0; opacity: .25; }
        </style>
    `;

    const bodyContent = `
        <img src="/nanotracker.png" />
        <h1>Your Activity Has Been Tracked by NanoTrack</h1>
        <div class="tracking-data">${readableTrackingData}</div>
        <caption>Typically you would get a 1x1 transparent pixel displayed, but since you've accessed this directly we're being transparent by showing you the data that has been collected.</caption>
        <hr/>
        <div class="infoBlock">${generateInfoBlockContent()}</div>
    `;

    return `
    <html>
        <head>${headContent}${styles}</head>
        <body>${bodyContent}</body>
    </html>
    `;
}

/**
 * Generates the content for the information block in the UI.
 * @returns {String} - HTML content for the information block.
 */
function generateInfoBlockContent(): string {
    return `
    <h2>What Is NanoTrack?</h2>
    <p>In an era where digital privacy is paramount, NanoTrack emerges as a cutting-edge analytics tool, meticulously designed to balance the critical need for comprehensive website traffic insights with the utmost respect for user privacy.</p>

    <h3>What Sets NanoTrack Apart?</h3>
    <ul>
        <li><strong>Privacy-Centric Analytics</strong>: At NanoTrack, we believe in ethical data collection. Unlike conventional analytics tools, we steer clear of invasive techniques like user or session fingerprinting. Our approach is straightforward and transparent – we collect basic access logs, ensuring that your privacy is never compromised.</li>
        <li><strong>Trustworthy Insights</strong>: We focus on delivering accurate and valuable traffic data, crucial for website developers and owners. With NanoTrack, you receive insights you can trust, aiding in making informed decisions without infringing on user privacy.</li>
        <li><strong>User Empowerment</strong>: We're committed to user empowerment. Our platform is built on the principle that users have a right to know how their data is being used. That's why, if you've landed on this page, it's because you were curious about the tracking pixel on a site using NanoTrack. We're here to provide clarity and assurance.</li>
        <li><strong>Compliance and Ethics</strong>: In compliance with global data protection regulations, NanoTrack ensures that all data collection is ethical and legal. We prioritize your privacy, always.</li>
        <li><strong>Innovative Simplicity</strong>: By focusing on essential metrics and avoiding unnecessary data bloat, NanoTrack offers a streamlined, efficient, and easy-to-understand analytics experience.</li>
    </ul>

    <h3>Our Commitment to Transparency</h3>
    <p>Your curiosity about how your data is being used has led you here, and we commend that. NanoTrack stands as a beacon of transparency in a sea of opaque data practices. We don't just track website visits; we aim to set a new standard for how web analytics should ethically operate in a privacy-conscious world.</p>

    <h3>Join the Movement</h3>
    <p>By choosing or visiting sites that use NanoTrack, you're part of a growing movement that values digital privacy. Together, we're shaping a future where web analytics and user privacy coexist harmoniously. If you have any questions or want to learn more about our practices, feel free to reach out. Your privacy, our priority – that's the NanoTrack promise.</p>
    `;
}