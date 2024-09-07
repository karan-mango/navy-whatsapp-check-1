const express = require('express');
const axios = require('axios');
const app = express();

// Configuration values
const WHATSAPP_NUMBER_ID = '429325400258083';  // Your WhatsApp Number ID
const WHATSAPP_TOKEN = 'EAAGc27WZBMrMBOwlPES7KKAFU35pgOhMt20r7eIQ4O3SctgykzfH7rrH3WTMGUlT1egIj8TAjieRZAgXlBrTJMFxLZBGCwIIB4XvW7DHT6YZASpUblgo1TVZAJkyVCQOHxVKlPKVXxGoEnTZA38VsKe9WhM46acUnRpRZCcZAhpw2rUSKEZCAm4fQZC8L8yib7TYuLSwbD00FY9C9WkwphUUpUwVo0ysQZD';  // Your WhatsApp API Token
const WHATSAPP_VERIFY_TOKEN = 'my_custom_verify_token';  // Your custom verification token

app.use(express.json());

// Root endpoint to display a simple message
app.get('/', (req, res) => {
    res.send('Server is running and ready to receive messages!');
});

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

// Webhook to receive messages
app.post('/webhook', async (req, res) => {
    console.log('Incoming message received: ', req.body);

    const incomingMessage = req.body;

    if (incomingMessage.entry) {
        const messageContent = incomingMessage.entry[0].changes[0].value.messages[0];
        const fromNumber = messageContent.from;
        const messageText = messageContent.text.body;

        let responseText = '';
        if (messageText === '1') {
            responseText = 'Hello World';
        } else if (messageText === '2') {
            responseText = 'Hello User';
        } else {
            responseText = 'Hello Customer, user-initiated service';
        }

        try {
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
        } catch (error) {
            console.error('Error sending response:', error.response ? error.response.data : error.message);
        }
    } else {
        console.log('No entry found in incoming message.');
    }

    res.sendStatus(200);
});

// Start server
app.listen(3000, () => console.log('Server is running on port 3000.'));
