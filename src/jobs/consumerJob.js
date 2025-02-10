// const { startConsumers } = require('../services/consumers/consumerService');
// const { startLogConsumers } = require('../services/consumers/faLogsToElastic');
const { startConsumers } = require('../services/consumers/serverLogsToElastic');

// const startConsumerJob = async () => {
//     try {
//         const topic = process.env.TOPIC_0;
//         console.log(`Starting Kafka consumer for topic "${topic}"...`);
//         await startConsumers(topic);
//     } catch (err) {
//         console.error('Error starting Kafka consumer job:', err);
//     }
// };

// const startLogConsumerJob = async () => {
//     try {
//         const topic = process.env.TOPIC_2;
//         console.log(`Starting Kafka consumer for topic "${topic}"...`);
//         await startLogConsumers(topic);
//     } catch (err) {
//         console.error('Error starting Kafka consumer job:', err);
//     }
// };

const startLogConsumerJob = async () => {
    try {
        await startConsumers(process.env.TOPIC_2, process.env.ELASTICSEARCH_INDEX_1, process.env.CONSUMER_GROUP_4);
    } catch (err) {
        console.error('Error starting log consumer job:', err);
    }
};

const startSseLogConsumerJob = async () => {
    try {
        await startConsumers(process.env.TOPIC_3, process.env.ELASTICSEARCH_INDEX_2, process.env.CONSUMER_GROUP_3);
    } catch (err) {
        console.error('Error starting SSE log consumer job:', err);
    }
};

module.exports = { startLogConsumerJob, startSseLogConsumerJob };