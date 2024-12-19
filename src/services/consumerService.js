const kafka = require('../config/kafkaConfig');
const axios = require('axios');

const consumer = kafka.consumer({ groupId: 'amplitude-consumer-group' });

async function consumeMessages(topic) {
    await consumer.connect();
    await consumer.subscribe({
        topic,
        fromBeginning: false
    });
    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const eventData = JSON.parse(message.value.toString());
            console.log(`Message consumed from topic "${topic}":`, eventData);
            await sendToAmplitude(eventData);
        }
    });
}

async function sendToAmplitude(eventData) {
    const apiKey = process.env.AMPLITUDE_API_KEY;
    const event = {
        event_type: eventData.event_name,
        event_properties: eventData.event_properties,
        user_id: eventData.user_id,
        time:  Date.now(),
        insert_id: eventData.event_name + eventData.user_id + Date.now()
    };

    try {
        const response = await axios.post('https://api2.amplitude.com/2/httpapi', {
            api_key: apiKey,
            options: {
                min_id_length: 1
              },
            events: [event],
        });
        console.log('Event successfully sent to Amplitude:', response.data);
    } catch (error) {
        console.error('Error sending event to Amplitude:', error);
    }
}

module.exports = { consumeMessages };