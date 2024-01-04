const mongoose = require('mongoose');
const fsp = require('fs').promises;
const path = require('path');

/**
 * Class representing a flat file database for storing JSON data.
 */
class FlatFileDB {
    constructor(filePath) {
        this.filePath = filePath;
    }

    /**
     * Initializes the flat file database, creating the file if it does not exist.
     */
    async initialize() {
        try {
            await fsp.access(this.filePath, fsp.constants.F_OK);
        } catch (err) {
            if (err.code === 'ENOENT') {
                await fsp.writeFile(this.filePath, JSON.stringify([]));
            } else {
                throw new Error(`Failed to initialize flat file DB: ${err.message}`);
            }
        }
    }

    /**
     * Saves data to the flat file database.
     * @param {Object} data - The data to be saved.
     * @returns {Promise<Object>} - The saved data.
     */
    async save(data) {
        try {
            const fileData = await fsp.readFile(this.filePath);
            const json = JSON.parse(fileData);
            json.push(data);
            await fsp.writeFile(this.filePath, JSON.stringify(json, null, 2));
            return data;
        } catch (err) {
            throw new Error(`Error saving data: ${err.message}`);
        }
    }

    /**
     * Retrieves data from the database matching a given query.
     * @param {Object} query - Query to filter the data.
     * @returns {Promise<Array>} - Matched data array.
     */
    async find(query = {}) {
        try {
            const fileData = await fsp.readFile(this.filePath);
            const json = JSON.parse(fileData);
            return json.filter(item => Object.keys(query).every(key => item[key] === query[key]));
        } catch (err) {
            throw new Error(`Error querying data: ${err.message}`);
        }
    }

    /**
     * Deletes records from the database that match the given query.
     * @param {Object} query - Query to match for deletion.
     * @returns {Promise<Object>} - Result of the deletion operation.
     */
    async deleteMany(query) {
        try {
            const fileData = await fsp.readFile(this.filePath);
            const json = JSON.parse(fileData);
            const updatedData = json.filter(item => !Object.keys(query).every(key => item[key] === query[key]));
            await fsp.writeFile(this.filePath, JSON.stringify(updatedData, null, 2));
            return { deletedCount: json.length - updatedData.length };
        } catch (err) {
            throw new Error(`Error deleting data: ${err.message}`);
        }
    }
}

/**
 * Initializes and manages the connection to the specified database type.
 */
class DBConnectionManager {
    constructor() {
        this.dbType = process.env.DB_TYPE || 'mongodb';
        this.flatFileDB = new FlatFileDB(path.join(__dirname, '../NanoTrack-DB.json'));
    }

    /**
     * Establishes connection to the chosen database.
     */
    async connect() {
        if (this.dbType === 'mongodb') {
            await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('MongoDB connected...');
        } else if (this.dbType === 'flatfile') {
            await this.flatFileDB.initialize();
            console.log('Flat file DB initialized...');
        }
    }

    /**
     * Provides access to the database.
     * @returns {mongoose|Mongoose} - The database instance.
     */
    getDB() {
        return this.dbType === 'mongodb' ? mongoose : this.flatFileDB;
    }
}

const dbConnectionManager = new DBConnectionManager();

module.exports = {
    dbConnect: dbConnectionManager.connect.bind(dbConnectionManager),
    getDB: dbConnectionManager.getDB.bind(dbConnectionManager)
};
