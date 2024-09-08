const { MongoClient } = require('mongodb');

// MongoDB configuration
const MONGO_URI = 'mongodb+srv://karancsengg1:Sanjaybhai%40123@cluster0.iozlj.mongodb.net/theaterBooking?retryWrites=true&w=majority';
const DATABASE_NAME = 'theaterBooking';
const COLLECTION_NAME = 'users';

// Function to connect to MongoDB and log users
async function logAllUsers() {
    const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    try {
        // Connect to the MongoDB client
        await client.connect();
        console.log('Connected to MongoDB');

        // Access the database and collection
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Fetch all users
        const users = await collection.find({}).toArray();
        console.log('Users in database:', users);

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
}

// Run the function to log users
logAllUsers();
