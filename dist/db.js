"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * Class representing a flat file database for JSON data storage.
 */
class FlatFileDB {
    /**
     * Creates an instance of a flat file database.
     * @param {string} filePath The path to the JSON file used as a database.
     */
    constructor(filePath) {
        this.filePath = filePath;
    }
    /**
     * Initializes the flat file database, creating a new file if it doesn't already exist.
     */
    async initialize() {
        try {
            await fs_1.promises.access(this.filePath);
        }
        catch (error) {
            const err = error; // Cast the error to the ErrnoException interface
            if (err.code === 'ENOENT') {
                await fs_1.promises.writeFile(this.filePath, JSON.stringify([]));
            }
            else {
                throw new Error(`Failed to initialize flat file database: ${err.message}`);
            }
        }
    }
    /**
     * Saves data to the flat file database.
     * @param {Object} data The data to save.
     * @returns {Promise<Object>} The saved data.
     */
    async save(data) {
        try {
            const fileData = await fs_1.promises.readFile(this.filePath, 'utf8');
            const jsonData = JSON.parse(fileData);
            jsonData.push(data);
            await fs_1.promises.writeFile(this.filePath, JSON.stringify(jsonData, null, 2));
            return data;
        }
        catch (error) {
            const err = error; // Cast the error
            throw new Error(`Error saving data: ${err.message}`);
        }
    }
    /**
     * Finds data in the database that matches the given query.
     * @param {Object} query The query to match against.
     * @returns {Promise<Array<Item>>} The matched data.
     */
    async find(query = {}) {
        try {
            const fileData = await fs_1.promises.readFile(this.filePath, 'utf8');
            const jsonData = JSON.parse(fileData);
            return jsonData.filter(item => Object.keys(query).every(key => item[key] === query[key]));
        }
        catch (error) {
            const err = error; // Cast the error
            throw new Error(`Error querying data: ${err.message}`);
        }
    }
    /**
     * Deletes records from the database that match the given query.
     * @param {Object} query The query to match for deletion.
     * @returns {Promise<{deletedCount: number}>} The result of the deletion operation.
     */
    async deleteMany(query) {
        try {
            const fileData = await fs_1.promises.readFile(this.filePath, 'utf8');
            const jsonData = JSON.parse(fileData);
            const updatedData = jsonData.filter(item => !Object.keys(query).every(key => item[key] === query[key]));
            await fs_1.promises.writeFile(this.filePath, JSON.stringify(updatedData, null, 2));
            return { deletedCount: jsonData.length - updatedData.length };
        }
        catch (error) {
            const err = error; // Cast the error
            throw new Error(`Error deleting data: ${err.message}`);
        }
    }
}
/**
 * Manages the connection to the database.
 */
class DBConnectionManager {
    constructor() {
        this.dbType = process.env.DB_TYPE || 'flatfile'; // Default to 'flatfile' if DB_TYPE is not set
        this.flatFileDB = new FlatFileDB(path_1.default.join(__dirname, '../NanoTrack-DB.json'));
    }
    /**
     * Connects to the database based on the configured database type.
     */
    async connect() {
        if (this.dbType === 'mongodb') {
            await mongoose_1.default.connect(process.env.MONGO_URI);
            console.log('MongoDB connected...');
        }
        else if (this.dbType === 'flatfile') {
            await this.flatFileDB.initialize();
            console.log('Flat file database initialized...');
        }
    }
    /**
     * Returns the database instance.
     * @returns {mongoose|Mongoose|FlatFileDB} The database instance.
     */
    getDB() {
        return this.dbType === 'mongodb' ? mongoose_1.default : this.flatFileDB;
    }
}
const dbConnectionManager = new DBConnectionManager();
exports.dbConnect = dbConnectionManager.connect.bind(dbConnectionManager);
exports.getDB = dbConnectionManager.getDB.bind(dbConnectionManager);
