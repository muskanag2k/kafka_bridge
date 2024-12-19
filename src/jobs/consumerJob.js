const { consumeMessages } = require('../services/consumerService');

const startConsumerJob = async () => {
    try {
        const topic = 'amplitude_events';
        console.log(`Starting Kafka consumer for topic "${topic}"...`);
        await consumeMessages(topic);
    } catch (err) {
        console.error('Error starting Kafka consumer job:', err);
    }
};

module.exports = { startConsumerJob };