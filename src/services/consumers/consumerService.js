const { kafka, logLevel } = require('../../config/kafkaConfig');
const axios = require('axios');

const consumer_1 = kafka.consumer({
    groupId: process.env.CONSUMER_GROUP_1,
    sessionTimeout: 30000,  //30 secs
    logLevel: logLevel.DEBUG,
 });

const consumer_2 = kafka.consumer({
    groupId: process.env.CONSUMER_GROUP_2,
    sessionTimeout: 30000, // 30 secs
    logLevel: logLevel.DEBUG,
});

async function consumeMessages(consumer, topic) {
    await consumer.connect();
    await consumer.subscribe({
        topic,
        fromBeginning: false
    });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const eventData = JSON.parse(message.value.toString());
            console.log(`Message consumed from topic "${topic}", partition "${partition}":`, eventData.event_name);
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

//start consumers
async function startConsumers() {
    const topic = process.env.TOPIC_0;
    await Promise.all([
        consumeMessages(consumer_1, topic),
        consumeMessages(consumer_2, topic),
    ]);
}

module.exports = { startConsumers };