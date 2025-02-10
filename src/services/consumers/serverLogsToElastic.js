const { kafka, logLevel } = require('../../config/kafkaConfig');
const { Client } = require('@elastic/elasticsearch');

global.ReadableStream = require('stream/web').ReadableStream;

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
            const eventData = JSON.parse(message.value.toString());
            console.log(`Consumer processing partition ${partition} for topic ${topic}:`, eventData);
            await sendToElasticsearch(eventData, index);
        }
    });
}

async function sendToElasticsearch(message, index) {
    try {
        await esClient.index({
            index,
            document: message,
        });
    } catch (error) {
        console.error(`Elasticsearch indexing error for index ${index}:`, error);
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
