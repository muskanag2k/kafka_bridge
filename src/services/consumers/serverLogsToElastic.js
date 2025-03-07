const { kafka, logLevel } = require('../../config/kafkaConfig');
const { Client } = require('@elastic/elasticsearch');
const moment = require('moment');

const { Readable } = require('stream');
global.ReadableStream = Readable;

const getWeeklyIndexName = (baseIndex) => {
    const year = moment().year();
    const week = moment().isoWeek();
    return `${baseIndex}_${year}_week_${week}`;
};

const consumers = [];

const createConsumer = (groupId) => kafka.consumer({
    groupId,
    sessionTimeout: 50000,
    heartbeatInterval: 20000,
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
            try {
                let rawMessage = message.value.toString();
                const { default: stripAnsi } = await import('strip-ansi');
                let ansi_parsed = stripAnsi(rawMessage);
                const eventData = JSON.parse(ansi_parsed);

                let parsedMessage;
                try {
                    let message = stripAnsi(eventData.message);
                    parsedMessage = JSON.parse(message);
                } catch (error) {
                    parsedMessage = { message: eventData.message };
                }

                const logMessage = { ...eventData, ...parsedMessage };
                const elastic_index = getWeeklyIndexName(index);
                console.log(`Consumer processing partition ${partition} for topic ${topic}:`, logMessage);
                await sendToElasticsearch(logMessage, elastic_index);
            } catch (error) {
                console.error(`Error processing Kafka message:`, error);
            }
        }
    });
}

async function sendToElasticsearch(message, index) {
    try {
        if (typeof message.message === 'object') {
            message.message = JSON.stringify(message.message);
        }
        const response = await esClient.index({
            index,
            body: message,
        });
        console.log(`Successfully indexed document:`, response);
    } catch (error) {
        console.error(`Elasticsearch indexing error for index ${index}:`, error.meta?.body || error);
    }
}

async function startConsumers(topic, index, groupId, consumers_in_group) {
    for (let i = 0; i < consumers_in_group; i++) {
        const consumer = createConsumer(groupId);
        consumers.push(consumer);
        await consumeMessages(consumer, topic, index);
    }
}

module.exports = { startConsumers };
