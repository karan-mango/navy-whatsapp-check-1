const express = require('express');
const axios = require('axios');
const app = express();

// Updated Configuration values
const WHATSAPP_NUMBER_ID = '429325400258083';  // Replace with your WhatsApp Phone ID
const WHATSAPP_TOKEN = 'EAAGc27WZBMrMBOxpusjGf99oVaGQVqwJze2o5mvq05PourfTWH6v2L4QVOulniFDgqRzFOyrzfgZA8IxmX7q6zdjj6HZAN4ZAFgo6h9dnKsV9UaGmLlnKj4GH3xJkyZB1nT4NoSFCPmlCEZB5KwILP7nud5KoIWLQMaQyhkL0mQZBzLtm5x4GriDm1WOPDB4jomDKZCR8uaLCGZC9ZCagr1bABqZAQ1Iys5JioIcT4P';  // Replace with your new WhatsApp API Token
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
    // Log the full incoming message body for debugging
    console.log('Incoming message received: ', JSON.stringify(req.body, null, 2));

    const incomingMessage = req.body;

    if (incomingMessage.entry) {
        try {
            const changes = incomingMessage.entry[0].changes;
            if (changes && changes.length > 0 && changes[0].value && changes[0].value.messages) {
                const messageContent = changes[0].value.messages[0];
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
        } catch (error) {
            console.error('Error processing incoming message:', error.message);
        }
    } else {
        console.log('No entry found in incoming message.');
    }

    res.sendStatus(200);
});


// Start server
app.listen(3000, () => console.log('Server is running on port 3000.'));
