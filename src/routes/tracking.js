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

            data = data.slice(skip, skip + limit);

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
            
            if (!campaignData || campaignData.length <=0) {
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
            await TrackingData.deleteMany({ campaignID });

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

            if (!req.headers.referer) {
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

                res.send(`
                    <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    margin: 0;
                                    padding: 0;
                                    background-color: #f4f4f4;
                                    color: #333;
                                    text-align: center;
                                }
                                h1 {
                                    color: #007bff;
                                    margin-top: 20px;
                                }
                                .tracking-data {
                                    background-color: #fff;
                                    border: 1px solid #ddd;
                                    padding: 15px;
                                    margin: 20px auto;
                                    width: 80%;
                                    text-align: left;
                                }
                            </style>
                        </head>
                        <body>
                            <h1>Your Activity Has Been Tracked by NanoTrack</h1>
                            <div class="tracking-data">
                                <p>Tracking Data:</p>
                                ${readableTrackingData}
                            </div>
                            <caption>Normally you would get a 1x1 transparent pixel displayed, but since you've accessed this directly we're being transparent by showing you the data that has been collected.</caption>
                        </body>
                    </html>
                `);
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
            ip: req.ip,
            ...geo
        },
        domain: req.hostname,
        timestamp: new Date().toISOString(),
        acceptHeaders: req.headers['accept'],
        dnt: req.headers['dnt'],
        httpVersion: req.httpVersion
    };
    const trackingData = { ...trackingInfo, campaignID: req.query.campaignID };

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