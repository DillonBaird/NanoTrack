const mongoose = require('mongoose');
const { getDB } = require('../db'); // Import getDB from db.js

// Define the Mongoose schema for tracking data
const trackingDataSchema = new mongoose.Schema({
    host: String,
    referer: String,
    params: mongoose.Schema.Types.Mixed,
    path: String,
    decay: Number,
    useragent: {
        browser: String,
        version: String,
        device: String, // Device type (mobile/desktop)
        os: String, // Operating System
    },
    language: [String],
    geo: {
        ip: String,
        city: String, // City from geoip lookup
        country: String // Country from geoip lookup
    },
    domain: String,
    timestamp: { type: Date, default: Date.now },
    acceptHeaders: String, // Accept Headers
    dnt: String, // Do Not Track Setting
    httpVersion: String, // HTTP Protocol Version
    campaignID: {
        type: String,
        required: true,
    },
});

// TrackingDataAdapter class to handle database operations
class TrackingDataAdapter {
    constructor(model) {
        this.model = model;
    }

    /**
     * Saves a document to the database.
     * @param {Object} document The document to save.
     * @returns {Promise} The saved document.
     */
    async save(document) {
        const db = getDB();
        if (db.model) {
            // Use Mongoose model to save for MongoDB
            return new this.model(document).save();
        } else {
            // Use flat file save method
            return db.save(document);
        }
    }

    /**
     * Finds documents in the database matching a query.
     * @param {Object} query The query to match.
     * @returns {Promise} Array of found documents.
     */
    async find(query) {
        const db = getDB();
        if (db.model) {
            // Use Mongoose model to find for MongoDB
            return this.model.find(query);
        } else {
            // Use flat file find method
            return db.find(query);
        }
    }

    /**
     * Deletes documents from the database matching a specific campaignID.
     * @param {String} campaignID The campaignID to match for deletion.
     * @returns {Promise} Result of the deletion operation.
     */
    async deleteMany(campaignID) {
        const db = getDB();
        if (db.model) {
            // Use Mongoose model to delete for MongoDB
            return this.model.deleteMany({ campaignID });
        } else {
            // If using a flat file, implement a corresponding delete logic
            return db.deleteMany(campaignID);
            // throw new Error('deleteByCampaignID method not implemented for flat file DB');
        }
    }

    // Additional methods (e.g., findById, deleteOne) can be implemented as needed
}

// Create and export an instance of the TrackingDataAdapter
const TrackingDataModel = mongoose.model('TrackingData', trackingDataSchema);
module.exports = new TrackingDataAdapter(TrackingDataModel);
