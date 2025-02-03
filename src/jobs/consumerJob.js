const { startConsumers } = require('../services/consumers/consumerService');
const { startLogConsumers } = require('../services/consumers/logsToElastic');

const startConsumerJob = async () => {
    try {
        const topic = process.env.TOPIC_0;
        console.log(`Starting Kafka consumer for topic "${topic}"...`);
        await startConsumers(topic);
    } catch (err) {
        console.error('Error starting Kafka consumer job:', err);
    }
};

const startLogConsumerJob = async () => {
    try {
        const topic = process.env.TOPIC_1;
        console.log(`Starting Kafka consumer for topic "${topic}"...`);
        await startLogConsumers(topic);
    } catch (err) {
        console.error('Error starting Kafka consumer job:', err);
    }
};

module.exports = { startConsumerJob, startLogConsumerJob };