const { kafka, logLevel } = require('../../config/kafkaConfig');
const { Client } = require('@elastic/elasticsearch');
const stripAnsi = require('strip-ansi');
const moment = require('moment');

const { Readable } = require('stream');
global.ReadableStream = Readable;

const getWeeklyIndexName = (baseIndex, host) => {
    const year = moment().year();
    const week = moment().isoWeek();
    const sanitizedHost = host.replace(/\W+/g, '_');
    return `${baseIndex}_${sanitizedHost}_${year}_week_${week}`;
};

const NUM_CONSUMERS = process.env.NUM_CONSUMERS || 60;
const consumers = [];

const createConsumer = (groupId) => kafka.consumer({
    groupId,
    sessionTimeout: 30000,
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
            try {
                let rawMessage = message.value.toString();
                let msg1, msg2;
                (async () => {
                    const { default: stripAnsi } = await import('strip-ansi');

                    msg1 = stripAnsi(message);
                    msg2 = stripAnsi(rawMessage);

                    console.log(cleanMessage);
                })();

                // rawMessage = rawMessage.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
                const eventData = JSON.parse(msg2);
                console.log("message 1:", msg1);
                console.log("message 2:", msg2);
                console.log("json parsed:", eventData);

                let parsedMessage;
                try {
                    let message = eventData.message;
                    message = message.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
                    parsedMessage = JSON.parse(message);
                } catch (error) {
                    parsedMessage = { message: eventData.message };
                }
                console.log("parsed message:", parsedMessage);
                const logMessage = { ...eventData, ...parsedMessage };
                const elastic_index = getWeeklyIndexName(index, eventData.host);
                console.log(`Consumer processing partition ${partition} for topic ${topic}:`, logMessage);
                // await sendToElasticsearch(logMessage, elastic_index);
            } catch (error) {
                console.error(`Error processing Kafka message:`, error);
            }
        }
    });
}


async function sendToElasticsearch(message, index) {
    try {
        const payload = typeof message === 'object' ? message : { message };
        const response = await esClient.index({
            index,
            body: payload,
        });
        console.log(`Successfully indexed document:`, response);
    } catch (error) {
        console.error(`Elasticsearch indexing error for index ${index}:`, error.meta?.body || error);
    }
}

async function startConsumers(topic, index, groupId) {
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        const consumer = createConsumer(groupId);
        consumers.push(consumer);
        await consumeMessages(consumer, topic, index);
    }
}

module.exports = { startConsumers };
