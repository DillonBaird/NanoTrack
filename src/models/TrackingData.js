const mongoose = require('mongoose');
const { getDB } = require('../db'); // Importing getDB from db.js

/**
 * Schema definition for tracking data using Mongoose.
 */
const trackingDataSchema = new mongoose.Schema({
    host: String,
    referrer: String,
    params: mongoose.Schema.Types.Mixed,
    path: String,
    decay: Number,
    useragent: {
        browser: String,
        version: String,
        device: String, // Type of device (mobile/desktop)
        os: String, // Operating System
    },
    language: [String],
    geo: {
        ip: String,
        city: String, // City determined via geoip lookup
        country: String // Country determined via geoip lookup
    },
    domain: String,
    timestamp: { type: Date, default: Date.now },
    acceptHeaders: String, // HTTP Accept Headers
    dnt: String, // Do Not Track preference
    httpVersion: String, // HTTP Protocol Version
    campaignID: {
        type: String,
        required: true,
    },
});

/**
 * Class to manage database operations for tracking data.
 */
class TrackingDataAdapter {
    constructor(model) {
        this.model = model;
    }

    /**
     * Saves a new tracking data document in the database.
     * @param {Object} document - Document to be saved.
     * @returns {Promise} - Promise resolving with the saved document.
     */
    async save(document) {
        const db = getDB();
        if (db.model) {
            return new this.model(document).save();
        } else {
            return db.save(document); // Fallback for flat file database
        }
    }

    /**
     * Retrieves documents from the database matching a given query.
     * @param {Object} query - Query object to filter documents.
     * @returns {Promise<Array>} - Promise resolving with an array of matched documents.
     */
    async find(query) {
        const db = getDB();
        if (db.model) {
            return this.model.find(query);
        } else {
            return db.find(query); // Fallback for flat file database
        }
    }

    /**
     * Deletes documents from the database matching a specified campaignID.
     * @param {String} campaignID - Campaign ID for matching documents to delete.
     * @returns {Promise} - Promise resolving with the result of the deletion operation.
     */
    async deleteMany(campaignID) {
        const db = getDB();
        if (db.model) {
            return this.model.deleteMany({ campaignID });
        } else {
            return db.deleteMany({ campaignID }); // Fallback for flat file database
            // Consider throwing an error if method is not implemented for flat file DB
        }
    }

    // Additional methods (e.g., findById, deleteOne) can be implemented as required.
}

// Export an instance of TrackingDataAdapter using the TrackingData model
const TrackingDataModel = mongoose.model('TrackingData', trackingDataSchema);
module.exports = new TrackingDataAdapter(TrackingDataModel);
