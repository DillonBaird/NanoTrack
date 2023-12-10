const mongoose = require('mongoose');
const fsp = require('fs').promises;
const path = require('path');

/**
 * Class representing a flat file database.
 */
class FlatFileDB {
    constructor(filePath) {
        this.filePath = filePath;
    }

    /**
     * Connects to the flat file database by ensuring the file exists.
     */
    async connect() {
        try {
            // Check if the file exists
            await fsp.access(this.filePath, fsp.constants.F_OK);
        } catch (err) {
            if (err.code === 'ENOENT') {
                // Create the file if it doesn't exist
                await fsp.writeFile(this.filePath, JSON.stringify([]));
            } else {
                // Handle other errors
                console.error('Error initializing flat file DB:', err);
                throw err;
            }
        }
    }

    /**
     * Saves data to the flat file database.
     * @param {*} data Data to be saved.
     * @returns {*} The saved data.
     */
    async save(data) {
        console.log('Saving data to flat file:', data);
        try {
            let fileData = await fsp.readFile(this.filePath);
            let json = JSON.parse(fileData);
            json.push(data);
            await fsp.writeFile(this.filePath, JSON.stringify(json, null, 2));
            console.log('Data saved successfully.');
            return data;
        } catch (err) {
            console.error('Error saving data to flat file DB:', err);
            throw err;
        }
    }

    /**
     * Finds data in the flat file database matching a query.
     * @param {*} query Query to filter the data.
     * @returns {Array} Array of matched data.
     */
    async find(query) {
        console.log('Fetching data from flat file with query:', query);
        try {
            let fileData = await fsp.readFile(this.filePath);
            let json = JSON.parse(fileData);
            console.log('Data fetched successfully.');

            // Return all data if no query is provided
            if (!query || Object.keys(query).length === 0) {
                return json;
            }

            // Filter data based on the query
            return json.filter(item => {
                for (const key in query) {
                    if (query.hasOwnProperty(key)) {
                        if (!item.hasOwnProperty(key) || item[key] !== query[key]) {
                            return false;
                        }
                    }
                }
                return true;
            });
        } catch (err) {
            console.error('Error querying data from flat file DB:', err);
            throw err;
        }
    }

    /**
     * Deletes documents from the database matching a specific query.
     * @param {*} query Query to match for deletion.
     * @returns {Promise} Result of the deletion operation.
     */
    async deleteMany(query) {
        try {
            let fileData = await fsp.readFile(this.filePath);
            let json = JSON.parse(fileData);

            // Filter out the records that do not match the query
            const updatedData = json.filter(item => {
                for (const key in query) {
                    if (query.hasOwnProperty(key) && item[key] === query[key]) {
                        return false;
                    }
                }
                return true;
            });

            await fsp.writeFile(this.filePath, JSON.stringify(updatedData, null, 2));
            return { deletedCount: json.length - updatedData.length };
        } catch (err) {
            console.error('Error deleting data from flat file DB:', err);
            throw err;
        }
    }

}

// Determine database type and setup connection
const dbType = process.env.DB_TYPE || 'mongodb';
const flatFilePath = path.join(__dirname, '../NanoTrack-DB.json');
const flatFileDB = new FlatFileDB(flatFilePath);

/**
 * Connects to the chosen database type.
 */
const dbConnect = () => {
    if (dbType === 'mongodb') {
        // MongoDB connection
        mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => console.log('MongoDB connected...'))
            .catch(err => console.error('MongoDB connection error:', err));
    } else if (dbType === 'flatfile') {
        // Flat file database connection
        flatFileDB.connect()
            .then(() => console.log('Flat file DB initialized...'))
            .catch(err => console.error('Flat file DB initialization error:', err));
    }
};

// Exporting database connection and access functions
module.exports = {
    dbConnect,
    getDB: () => dbType === 'mongodb' ? mongoose : flatFileDB
};
