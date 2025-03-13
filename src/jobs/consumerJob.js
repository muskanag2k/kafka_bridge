const { startConsumers } = require('../services/consumers/serverLogsToElastic');

const startFALogConsumerJob = async () => {
    try {
        await startConsumers(process.env.TOPIC_6, process.env.ELASTICSEARCH_INDEX_5, process.env.CONSUMER_GROUP_6, process.env.CONSUMERS_3);
    } catch (err) {
        console.error('Error starting log consumer job:', err);
    }
};

const startOpsLogConsumerJob = async () => {
    try {
        await startConsumers(process.env.TOPIC_7, process.env.ELASTICSEARCH_INDEX_6, process.env.CONSUMER_GROUP_7, process.env.CONSUMERS_3);
    } catch (err) {
        console.error('Error starting log consumer job:', err);
    }
};

const startSseLogConsumerJob = async () => {
    try {
        await Promise.all([
            startConsumers(process.env.TOPIC_3, process.env.ELASTICSEARCH_INDEX_2, process.env.CONSUMER_GROUP_3, process.env.CONSUMERS_1),
            startConsumers(process.env.TOPIC_4, process.env.ELASTICSEARCH_INDEX_3, process.env.CONSUMER_GROUP_4, process.env.CONSUMERS_1),
            startConsumers(process.env.TOPIC_5, process.env.ELASTICSEARCH_INDEX_4, process.env.CONSUMER_GROUP_5, process.env.CONSUMERS_2)
        ]);
    } catch (err) {
        console.error('Error starting SSE log consumer job:', err);
    }
};

module.exports = { startFALogConsumerJob, startOpsLogConsumerJob, startSseLogConsumerJob };