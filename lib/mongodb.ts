import mongoose from 'mongoose';

// Define the connection cache type
type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include our mongoose cache
declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;


// Initialize the cache on the global object to persist across hot reloads in development
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

/**
 * * Open or reuse a cached Mongoose connection to the MongoDB URI configured in MONGODB_URI.
 *  *
 *  * @returns The connected Mongoose instance
 *  * @throws The error raised while attempting to establish the connection if connection fails
 */
async function connectDB(): Promise<typeof mongoose> {
    // Return existing connection if available
    if (cached.conn) {
        return cached.conn;
    }

    // Return existing connection promise if one is in progress
    if (!cached.promise) {
        // Validate MongoDB URI exists
        if (!MONGODB_URI) {
            throw new Error(
                'Please define the MONGODB_URI environment variable inside .env.local'
            );
        }
        const options = {
            bufferCommands: false, // Disable Mongoose buffering
        };

        // Create a new connection promise
        cached.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        // Wait for the connection to establish
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset promise on error to allow retry
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default connectDB;