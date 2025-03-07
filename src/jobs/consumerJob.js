const { startConsumers } = require('../services/consumers/serverLogsToElastic');

const startLogConsumerJob = async () => {
    try {
        await startConsumers(process.env.TOPIC_2, process.env.ELASTICSEARCH_INDEX_1, process.env.CONSUMER_GROUP_2);
    } catch (err) {
        console.error('Error starting log consumer job:', err);
    }
};

const startSseLogConsumerJob = async () => {
    try {
        await Promise.all([
            startConsumers(process.env.TOPIC_3, process.env.ELASTICSEARCH_INDEX_2, process.env.CONSUMER_GROUP_3),
            startConsumers(process.env.TOPIC_4, process.env.ELASTICSEARCH_INDEX_3, process.env.CONSUMER_GROUP_4)
        ]);
    } catch (err) {
        console.error('Error starting SSE log consumer job:', err);
    }
};

module.exports = { startLogConsumerJob, startSseLogConsumerJob };