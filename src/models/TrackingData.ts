import mongoose, { Document, Model } from 'mongoose';
import { getDB } from '../db';

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
 * Schema definition for tracking data using Mongoose.
 */
const trackingDataSchema = new mongoose.Schema<TrackingDataDocument>({
  host: String,
  referrer: String,
  params: mongoose.Schema.Types.Mixed,
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
  private model: Model<TrackingDataDocument>;

  constructor(model: Model<TrackingDataDocument>) {
    this.model = model;
  }

  /**
   * Saves a new tracking data document in the database.
   * @param {Object} document - Document to be saved.
   * @returns {Promise} - Promise resolving with the saved document.
   */
  async save(document: TrackingDataDocument): Promise<TrackingDataDocument> {
    const db = getDB();
    if (hasModelMethod(db)) {
      return new this.model(document).save();
    } else {
      return db.save(document);
    }
  }

  /**
   * Retrieves documents from the database matching a given query.
   * @param {Object} query - Query object to filter documents.
   * @returns {Promise<Array>} - Promise resolving with an array of matched documents.
   */
  async find(query: object): Promise<TrackingDataDocument[]> {
    const db = getDB();
    if (hasModelMethod(db)) {
      return this.model.find(query);
    } else {
      return db.find(query);
    }
  }

  /**
   * Deletes documents from the database matching a specified campaignID.
   * @param {String} campaignID - Campaign ID for matching documents to delete.
   * @returns {Promise} - Promise resolving with the result of the deletion operation.
   */
  async deleteMany(campaignID: string): Promise<any> {
    const db = getDB();
    if (hasModelMethod(db)) {
      return this.model.deleteMany({ campaignID });
    } else {
      return db.deleteMany({ campaignID });
    }
  }

  // Additional methods (e.g., findById, deleteOne) can be implemented as required.
}

// Type guard to check if 'db' can be treated as a mongoose-like instance
function hasModelMethod(db: any): db is { model: Function } {
  return db && typeof db.model === 'function';
}

// Export an instance of TrackingDataAdapter using the TrackingData model
const TrackingDataModel = mongoose.model<TrackingDataDocument>('TrackingData', trackingDataSchema);
export default new TrackingDataAdapter(TrackingDataModel);