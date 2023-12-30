const express = require('express');
const geoip = require('geoip-lite');
const TrackingData = require('../models/TrackingData');
const WebSocket = require('ws');

module.exports = function (wss) {
    const router = express.Router();

    // Endpoint for fetching paginated tracking data
    router.get('/api/tracking-data', isAuthenticated, async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            let data = await TrackingData.find({});
            let total = data.length;

            data = data.reverse().slice(skip, skip + limit);

            res.json({
                total,
                page,
                pages: Math.ceil(total / limit),
                data
            });
        } catch (err) {
            res.status(500).send('Server Error');
        }
    });

    // Endpoint for fetching data to populate charts
    router.get('/api/chart-data', isAuthenticated, async (req, res) => {
        try {
            const allTrackingData = await TrackingData.find({});
            const pathCounts = {};
            const ipCounts = {};
            const campaignCounts = {};

            allTrackingData.forEach(item => {
                const path = item.path || 'Unknown';
                const date = new Date(item.decay).toLocaleDateString();
                const ip = item.geo?.ip || 'Unknown';
                const campaignID = item.campaignID || 'Unknown';

                pathCounts[path] = pathCounts[path] || {};
                pathCounts[path][date] = (pathCounts[path][date] || 0) + 1;

                ipCounts[ip] = (ipCounts[ip] || 0) + 1;
                campaignCounts[campaignID] = (campaignCounts[campaignID] || 0) + 1;
            });

            const reshapedData = {
                pathCounts: reshapeData(pathCounts),
                ipCounts: reshapeData(ipCounts, 'ip'),
                campaignCounts: reshapeData(campaignCounts, 'campaignID')
            };

            res.json(reshapedData);
        } catch (err) {
            res.status(500).send('Server Error');
        }
    });

    router.get('/api/campaign/:campaignId', isAuthenticated, async (req, res) => {
        try {
            const campaignId = req.params.campaignId;
            // Fetch data related to the campaign
            const campaignData = await TrackingData.find({ campaignID: campaignId });

            if (!campaignData || campaignData.length <= 0) {
                return res.status(404).json({ message: "Campaign not found" });
            }

            res.json(campaignData);
        } catch (err) {
            console.error('Error fetching campaign data:', err);
            res.status(500).send('Server Error');
        }
    });

    // DELETE endpoint for removing a specific campaign
    router.delete('/api/campaign/:campaignID', isAuthenticated, async (req, res) => {
        const { campaignID } = req.params;

        try {
            // Delete all tracking data associated with the campaignID
            await TrackingData.deleteMany(campaignID.toString());

            res.status(200).json({ message: 'Campaign deleted successfully' });
        } catch (err) {
            console.error('Error deleting campaign:', err);
            res.status(500).send('Server Error');
        }
    });

    // Middleware to validate campaignID in the request
    const validateCampaignID = (req, res, next) => {
        const { campaignID } = req.query;
        if (!campaignID) {
            return res.status(400).json({ error: 'Missing campaignID' });
        }
        next();
    };

    router.get('*', validateCampaignID, async (req, res) => {
        try {
            const trackingData = await saveAndBroadcastTrackingData(req, wss);

            // Check if the request is for click tracking and has a redirectURL
            if (req.path === '/click.gif' && req.query.redirectURL) {
                // Log the tracking data (already done in saveAndBroadcastTrackingData)

                // Redirect to the specified URL
                return res.redirect(req.query.redirectURL);
            }

            if (!req.headers.referer) {
                res.send(generateTrackingUI(trackingData));
            } else {
                sendPixelResponse(res);
            }
        } catch (err) {
            console.error('Error in route:', err);
            res.status(500).send('Server Error');
        }
    });




    return router;
};

const isAuthenticated = (req, res, next) => {
    if (req.cookies.auth) return next();
    res.redirect('/login');
};

// Function to generate readable tracking data from json
function generateReadableTrackingData(trackingData) {
    let readableTrackingData = '';
    Object.keys(trackingData).forEach(key => {
        if (typeof trackingData[key] === 'object' && trackingData[key] !== null) {
            readableTrackingData += `<strong>${key}:</strong><br>`;
            Object.keys(trackingData[key]).forEach(subKey => {
                readableTrackingData += `&nbsp;&nbsp;&nbsp;<strong>${subKey}:</strong> ${trackingData[key][subKey]}<br>`;
            });
        } else {
            readableTrackingData += `<strong>${key}:</strong> ${trackingData[key]}<br>`;
        }
    });
    return readableTrackingData;
}

// Function to generate direct access response
function generateTrackingUI(trackingData) {
    const readableTrackingData = generateReadableTrackingData(trackingData)
    return `
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NanoTrack Transparency Page</title>
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
                h1 {
                    margin-top: 20px;
                }
                .tracking-data {
                    background-color: #fff;
                    border: 1px solid #ddd;
                    padding: 15px;
                    margin: 50px auto;
                    width: 80%;
                    text-align: left;
                }
                img {
                    width: 150px;
                    margin-top: 50px;
                }
                h1 {
                    color: #007bff;
                }
                p {
                    margin-bottom: 1em;
                }
                .infoBlock {
                    max-width:80%;
                    margin: 0 auto;
                    font-size: .8rem;
                    opacity: .9;
                    text-align: left;

                }
                hr {
                    margin: 50px 0;
                    opacity: .25;
                }
            </style>
        </head>
        <body>
            <img src="/nanotracker.png" />
            <h1>Your Activity Has Been Tracked by NanoTrack</h1>
            <div class="tracking-data">
                ${readableTrackingData}
            </div>
            <caption>Typically you would get a 1x1 transparent pixel displayed, but since you've accessed this directly we're being transparent by showing you the data that has been collected.</caption>
            <hr/>
            <div class="infoBlock">
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
            </div>    
        </body>
    </html>
`
}

// Function to reshape data for chart outputs
function reshapeData(data, keyName = 'path') {
    return Object.keys(data).map(key => ({
        [keyName]: key,
        counts: Object.entries(data[key]).map(([date, count]) => ({ date, count }))
    }));
}

// Function to save tracking data and broadcast it to WebSocket clients
async function saveAndBroadcastTrackingData(req, wss) {

    const geo = geoip.lookup(req.ip) || {};
    let requestIP = req.ip;

    // Check if ANONYMIZE_IPS is set to true and the input IP is valid
    if (process.env.ANONYMIZE_IPS === 'true') {
        requestIP = '';

        // Update the geo object with the anonymized IP
        geo.ip = requestIP;
    }



    const trackingInfo = {
        host: req.get('host'),
        referer: req.get('referer') || '',
        params: req.query,
        path: req.path,
        decay: Date.now(),
        useragent: {
            browser: req.useragent.browser,
            version: req.useragent.version,
            device: req.useragent.isMobile ? 'mobile' : 'desktop',
            os: req.useragent.os,
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

    // Check if the DNT header is set to "1" (indicating the user's preference not to be tracked)
    if (req.headers['dnt'] === '1') {
        return trackingData; // Skip saving tracking data
    }

    // Save tracking data
    await TrackingData.save(trackingData);

    // Broadcast to WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(trackingData));
        }
    });

    return trackingData;
}

// Function to send a 1x1 pixel response
function sendPixelResponse(res) {
    const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAP///////ywAAAAAAQABAAACAkQBADs=',
        'base64'
    );
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
    });
    res.end(pixel);
}