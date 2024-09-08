const express = require('express');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

// MongoDB configuration
const MONGO_URI = 'mongodb+srv://karancsengg1:Sanjaybhai%40123@cluster0.iozlj.mongodb.net/theaterBooking?retryWrites=true&w=majority';
const DATABASE_NAME = 'theaterBooking';
const COLLECTION_NAME = 'users';

// WhatsApp API configuration
const WHATSAPP_NUMBER_ID = '429325400258083';  // Replace with your WhatsApp Phone ID
const WHATSAPP_TOKEN = 'EAAGc27WZBMrMBO8CwHnWQw1ALEDmET0JHymLLuiu7RDbUNKVGrv3lDraPwgDtGk7DZAde1p1mOdFGHRFws2JCEemxSSuaruP6qLjSZAwyvyZC9P5R4Ysb82T67dYBeAFdBtNzjkRJ12cfilZCdIqVDp9zQjNgwezDIayFZBPqA0F4mE43ZAVl2PEpZA2YnZBDUh5ZByhrMEP6GuQ1H7tnZBIM0f9pYks24VJuxbRdCm';  // Replace with your WhatsApp API Token
const WHATSAPP_VERIFY_TOKEN = 'my_custom_verify_token'; // Replace with your custom verification token

// Helper function to check user in MongoDB
async function checkUser(phoneNumber) {
    const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Print all users for debugging
        const users = await collection.find({}).toArray();
        console.log('Users in database:', users);

        // Check if the specific user exists
        const user = await collection.findOne({ phoneNumber: phoneNumber });
        return user;
    } catch (error) {
        console.error('Error checking user in MongoDB:', error);
        return null;
    } finally {
        await client.close();
    }
}

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        console.log('Webhook verified successfully!');
        res.status(200).send(challenge);
    } else {
        console.log('Failed to verify webhook.');
        res.sendStatus(403);
    }
});

// Endpoint to handle incoming messages
app.post('/webhook', async (req, res) => {
    console.log('Incoming message:', JSON.stringify(req.body, null, 2));
    const incomingMessage = req.body;

    if (incomingMessage.entry) {
        const changes = incomingMessage.entry[0].changes;
        if (changes && changes.length > 0 && changes[0].value && changes[0].value.messages) {
            const messageContent = changes[0].value.messages[0];
            const fromNumber = messageContent.from;
            const messageText = messageContent.text.body;

            console.log(`Received message from: ${fromNumber}`);

            // Check if user exists in MongoDB
            const user = await checkUser(fromNumber);

            console.log(`Checked user in database: ${fromNumber}`);
            let responseText = '';
            if (user) {
                if (messageText.toLowerCase() === 'hello') {
                    responseText = `Hello, ${user.name}! Welcome to the theater booking service.`;
                } else {
                    responseText = 'Sorry, please start by saying "hello".';
                }
            } else {
                responseText = 'Sorry, your number is not authenticated to use this service. gg';
                // Send all users' info to the unauthorized user
                await axios({
                    url: `https://graph.facebook.com/v20.0/${WHATSAPP_NUMBER_ID}/messages`,
                    method: 'post',
                    headers: {
                        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        messaging_product: 'whatsapp',
                        to: fromNumber,
                        text: { body: `Your number is not authenticated. Here are the users in the database:\n${JSON.stringify(user, null, 2)}` }
                    }
                });
            }

            // Send response to WhatsApp
            await axios({
                url: `https://graph.facebook.com/v20.0/${WHATSAPP_NUMBER_ID}/messages`,
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    messaging_product: 'whatsapp',
                    to: fromNumber,
                    text: { body: responseText }
                }
            });

            console.log('Response sent successfully!');
        } else {
            console.log('No messages found in the incoming payload.');
        }
    } else {
        console.log('No entry found in incoming message.');
    }

    res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
