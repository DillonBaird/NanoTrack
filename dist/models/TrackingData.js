"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../db");
/**
 * Schema definition for tracking data using Mongoose.
 */
const trackingDataSchema = new mongoose_1.default.Schema({
    host: String,
    referrer: String,
    params: mongoose_1.default.Schema.Types.Mixed,
    path: String,
    decay: Number,
    useragent: {
        browser: String,
        version: String,
        device: String,
        os: String,
    },
    language: [String],
    geo: {
        ip: String,
        city: String,
        country: String,
    },
    domain: String,
    timestamp: { type: Date, default: Date.now },
    acceptHeaders: String,
    dnt: String,
    httpVersion: String,
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
        const db = (0, db_1.getDB)();
        if (hasModelMethod(db)) {
            return new this.model(document).save();
        }
        else {
            return db.save(document);
        }
    }
    /**
     * Retrieves documents from the database matching a given query.
     * @param {Object} query - Query object to filter documents.
     * @returns {Promise<Array>} - Promise resolving with an array of matched documents.
     */
    async find(query) {
        const db = (0, db_1.getDB)();
        if (hasModelMethod(db)) {
            return this.model.find(query);
        }
        else {
            return db.find(query);
        }
    }
    /**
     * Deletes documents from the database matching a specified campaignID.
     * @param {String} campaignID - Campaign ID for matching documents to delete.
     * @returns {Promise} - Promise resolving with the result of the deletion operation.
     */
    async deleteMany(campaignID) {
        const db = (0, db_1.getDB)();
        if (hasModelMethod(db)) {
            return this.model.deleteMany({ campaignID });
        }
        else {
            return db.deleteMany({ campaignID });
        }
    }
}
// Type guard to check if 'db' can be treated as a mongoose-like instance
function hasModelMethod(db) {
    return db && typeof db.model === 'function';
}
// Export an instance of TrackingDataAdapter using the TrackingData model
const TrackingDataModel = mongoose_1.default.model('TrackingData', trackingDataSchema);
exports.default = new TrackingDataAdapter(TrackingDataModel);
