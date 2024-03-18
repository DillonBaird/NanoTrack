import mongoose, { Document } from 'mongoose';
import { promises as fsPromises } from 'fs';
import path from 'path';

// TypeScript doesn't have a built-in type for ErrnoException yet, so we define what we need:
interface ErrnoException extends Error {
    code?: string;
}

/**
 * Represents an item in the database.
 */
interface Item {
    id: number;
    name: string;
    // Add additional properties as needed.
}

interface UserAgent {
    browser: string;
    version: string;
    device: string;
    os: string;
}

interface Geo {
    ip: string;
    city: string;
    country: string;
}

interface TrackingDataDocument extends Document {
    [key: string]: any;
    host: string;
    referrer: string;
    params: any;
    path: string;
    decay: number;
    useragent: UserAgent;
    language: string[];
    geo: Geo;
    domain: string;
    timestamp: Date;
    acceptHeaders: string;
    dnt: string;
    httpVersion: string;
    campaignID: string;
}

/**
 * Class representing a flat file database for JSON data storage.
 */
class FlatFileDB {
    private filePath: string;

    /**
     * Creates an instance of a flat file database.
     * @param {string} filePath The path to the JSON file used as a database.
     */
    constructor(filePath: string) {
        this.filePath = filePath;
    }

    /**
     * Initializes the flat file database, creating a new file if it doesn't already exist.
     */
    async initialize(): Promise<void> {
        try {
            await fsPromises.access(this.filePath);
        } catch (error) {
            const err = error as ErrnoException; // Cast the error to the ErrnoException interface
            if (err.code === 'ENOENT') {
                await fsPromises.writeFile(this.filePath, JSON.stringify([]));
            } else {
                throw new Error(`Failed to initialize flat file database: ${err.message}`);
            }
        }
    }

    /**
     * Saves data to the flat file database.
     * @param {Object} data The data to save.
     * @returns {Promise<Object>} The saved data.
     */
    async save(data: TrackingDataDocument): Promise<TrackingDataDocument> {
        try {
            const fileData = await fsPromises.readFile(this.filePath, 'utf8');
            const jsonData = JSON.parse(fileData);
            jsonData.push(data);
            await fsPromises.writeFile(this.filePath, JSON.stringify(jsonData, null, 2));
            return data;
        } catch (error) {
            const err = error as ErrnoException; // Cast the error
            throw new Error(`Error saving data: ${err.message}`);
        }
    }


    /**
     * Finds data in the database that matches the given query.
     * @param {Object} query The query to match against.
     * @returns {Promise<Array<Item>>} The matched data.
     */
    async find(query: Partial<TrackingDataDocument> = {}): Promise<Array<TrackingDataDocument>> {
        try {
            const fileData = await fsPromises.readFile(this.filePath, 'utf8');
            const jsonData: Array<TrackingDataDocument> = JSON.parse(fileData);
            return jsonData.filter(item =>
                Object.keys(query).every(key =>
                    item[key] === query[key]
                )
            );
        } catch (error) {
            const err = error as ErrnoException; // Cast the error
            throw new Error(`Error querying data: ${err.message}`);
        }
    }


    /**
     * Deletes records from the database that match the given query.
     * @param {Object} query The query to match for deletion.
     * @returns {Promise<{deletedCount: number}>} The result of the deletion operation.
     */
    async deleteMany(query: Partial<TrackingDataDocument>): Promise<{ deletedCount: number }> {
        try {
            const fileData = await fsPromises.readFile(this.filePath, 'utf8');
            const jsonData: Array<TrackingDataDocument> = JSON.parse(fileData);
            const updatedData = jsonData.filter(item =>
                !Object.keys(query).every(key => item[key] === query[key])
            );
            await fsPromises.writeFile(this.filePath, JSON.stringify(updatedData, null, 2));
            return { deletedCount: jsonData.length - updatedData.length };
        } catch (error) {
            const err = error as ErrnoException; // Cast the error
            throw new Error(`Error deleting data: ${err.message}`);
        }
    }

}

/**
 * Manages the connection to the database.
 */
class DBConnectionManager {
    private dbType: string;
    private flatFileDB: FlatFileDB;

    constructor() {
        this.dbType = process.env.DB_TYPE || 'flatfile'; // Default to 'flatfile' if DB_TYPE is not set
        this.flatFileDB = new FlatFileDB(path.join(__dirname, '../NanoTrack-DB.json'));
    }

    /**
     * Connects to the database based on the configured database type.
     */
    async connect(): Promise<void> {
        if (this.dbType === 'mongodb') {
            await mongoose.connect(process.env.MONGO_URI!);
            console.log('MongoDB connected...');
        } else if (this.dbType === 'flatfile') {
            await this.flatFileDB.initialize();
            console.log('Flat file database initialized...');
        }
    }

    /**
     * Returns the database instance.
     * @returns {mongoose|Mongoose|FlatFileDB} The database instance.
     */
    getDB(): mongoose.Mongoose | FlatFileDB {
        return this.dbType === 'mongodb' ? mongoose : this.flatFileDB;
    }
}

const dbConnectionManager = new DBConnectionManager();

export const dbConnect = dbConnectionManager.connect.bind(dbConnectionManager);
export const getDB = dbConnectionManager.getDB.bind(dbConnectionManager);
