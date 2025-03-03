const { kafka, logLevel } = require('../../config/kafkaConfig');
const { Client } = require('@elastic/elasticsearch');
const { Readable } = require('stream');

const NUM_CONSUMERS = process.env.NUM_CONSUMERS || 60;
const consumers = [];

const createConsumer = (groupId) => kafka.consumer({
    groupId,
    sessionTimeout: 10000,
    heartbeatInterval: 3000,
    maxPollIntervalMs: 30000,
    maxPartitionFetchBytes: 10 * 1024 * 1024,
    fetchMinBytes: 1 * 1024 * 1024,
    logLevel: logLevel.ERROR,
});

const esClient = new Client({
    cloud: { id: process.env.ELASTIC_CLOUD_ID },
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
    },
    requestTimeout: 30000,
});

async function consumeMessages(consumer, topic, index) {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ partition, message }) => {
            let rawMessage = message.value.toString();
            rawMessage = rawMessage.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");

            const eventData = JSON.parse(rawMessage);
            const logMessage = eventData.message;
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(logMessage);
            } catch {
                parsedMessage = logMessage;
            }

            console.log(`Consumer processing partition ${partition} for topic ${topic}:`, parsedMessage);
            await sendToElasticsearch(parsedMessage, index);
        }
    });
}

async function sendToElasticsearch(message, index) {
    try {
        const payload = typeof message === 'object' ? message : { message };
        const response = await esClient.index({
            index,
            document: payload,
        });
        console.log(`Successfully indexed document:`, response.body);
    } catch (error) {
        console.error(`Elasticsearch indexing error for index ${index}:`, error.meta?.body || error);
    }
}

async function startConsumers(topic, index, groupId) {
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        const consumer = createConsumer(groupId);
        consumers.push(consumer);
        consumeMessages(consumer, topic, index);
    }
}

module.exports = { startConsumers };
