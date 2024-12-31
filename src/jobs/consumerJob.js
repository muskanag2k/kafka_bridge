const { startConsumers } = require('../services/consumerService');

const startConsumerJob = async () => {
    try {
        const topic = process.env.TOPIC_0;
        console.log(`Starting Kafka consumer for topic "${topic}"...`);
        await startConsumers(topic);
    } catch (err) {
        console.error('Error starting Kafka consumer job:', err);
    }
};

module.exports = { startConsumerJob };