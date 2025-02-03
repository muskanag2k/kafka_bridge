const { kafka, logLevel } = require('../../config/kafkaConfig');
const { Client } = require('@elastic/elasticsearch');

const consumer_1 = kafka.consumer({
    groupId: process.env.CONSUMER_GROUP_3,
    sessionTimeout: 30000,
    logLevel: logLevel.DEBUG,
 });

const esClient = new Client({ node: process.env.ELASTICSEARCH_NODE });

async function consumeMessages(consumer, topic) {
    await consumer.connect();
    await consumer.subscribe({
        topic,
        fromBeginning: false
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const eventData = JSON.parse(message.value.toString());
            console.log(`Message consumed from topic "${topic}", partition "${partition}":`, eventData.event_name);

            await sendToElasticsearch(eventData);
        }
    });
}

async function sendToElasticsearch(message) {
    const indexName = process.env.ELASTICSEARCH_INDEX;
    const document = JSON.parse(message.value);

    try {
        const response = await esClient.index({
            index: indexName,
            document,
        });

        console.log('Document indexed successfully in Elasticsearch:', response.body);
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
