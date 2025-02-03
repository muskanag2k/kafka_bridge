const { kafka, logLevel } = require('../../config/kafkaConfig');
global.ReadableStream = require('stream/web').ReadableStream;
const { Client } = require('@elastic/elasticsearch');

const consumer_1 = kafka.consumer({
    groupId: process.env.CONSUMER_GROUP_3,
    sessionTimeout: 30000,
    logLevel: logLevel.DEBUG,
});

const esClient = new Client({
    cloud: { id: process.env.ELASTIC_CLOUD_ID },
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD
    }
});

async function consumeMessages(consumer, topic) {
    await consumer.connect();
    await consumer.subscribe({
        topic,
        fromBeginning: false
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Message consumed from topic "${topic}", partition "${partition}":`, message);
            await sendToElasticsearch(message);
        }
    });
}

async function sendToElasticsearch(message) {
    const indexName = process.env.ELASTICSEARCH_INDEX;
    // const document = JSON.parse(message.value);

    try {
        const response = await esClient.index({
            index: indexName,
            document: message,
        });

        console.log('Document indexed successfully in Elasticsearch:', response);
    } catch (error) {
        console.error('Error indexing document in Elasticsearch:', error);
    }
}

async function startLogConsumers() {
    const topic = process.env.TOPIC_1;

    await Promise.all([
        consumeMessages(consumer_1, topic),
    ]);
}

module.exports = { startLogConsumers };
