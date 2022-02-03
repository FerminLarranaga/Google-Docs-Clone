const { MongoClient } = require('mongodb');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const dbClient = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

const getConnectedClient = async () => {
    await dbClient.connect();
    const client = await dbClient.db('Cluster0').collection('documents');
    // return {client: client, dbClient: connectedClient};
    return client;
}

module.exports = getConnectedClient;