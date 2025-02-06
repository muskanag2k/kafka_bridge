const { kafka, logLevel } = require('../../config/kafkaConfig');
global.ReadableStream = require('stream/web').ReadableStream;
const { Client } = require('@elastic/elasticsearch');

const NUM_CONSUMERS = 60;
const consumers = [];

const createConsumer = () => kafka.consumer({
    groupId: process.env.CONSUMER_GROUP_4,
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
        password: process.env.ELASTIC_PASSWORD
    },
    requestTimeout: 30000,
});

async function consumeMessages(consumer) {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.TOPIC_2, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ partition, message }) => {
            const eventData = JSON.parse(message.value.toString());
            console.log(`Consumer processing partition ${partition}:`, eventData);
            await sendToElasticsearch(eventData);
        }
    });
}

async function sendToElasticsearch(message) {
    try {
        await esClient.index({
            index: process.env.ELASTICSEARCH_INDEX,
            document: message,
        });
    } catch (error) {
        console.error('Elasticsearch indexing error:', error);
    }
}

async function startLogConsumers() {
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        const consumer = createConsumer();
        consumers.push(consumer);
        consumeMessages(consumer);
    }
}

module.exports = { startLogConsumers };
