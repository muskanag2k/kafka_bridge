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
const BULK_SIZE = 1000;
const FLUSH_INTERVAL = 30000; // Flush every 30 seconds
const queue = [];
let lastFlushTime = Date.now();

const createConsumer = (groupId) => kafka.consumer({
    groupId,
    sessionTimeout: 50000,
    heartbeatInterval: 20000,
    maxPollIntervalMs: 30000,
    maxPartitionFetchBytes: 5 * 1024 * 1024,
    fetchMinBytes: 256 * 1024,
    logLevel: logLevel.ERROR,
});

const createElasticsearchClient = (topic) => {
    const cloudId = topic === 'fa_prod_logs' ? process.env.CLONED_ELASTIC_CLOUD_ID : process.env.ELASTIC_CLOUD_ID;

    return new Client({
        cloud: { id: cloudId },
        auth: {
            username: process.env.ELASTIC_USERNAME,
            password: process.env.ELASTIC_PASSWORD,
        },
        requestTimeout: 30000,
    });
};

async function processQueue(log, index, topic) {
    queue.push({ index: { _index: index } }, log);
    currentTopic = topic

    const now = Date.now();
    if (queue.length >= BULK_SIZE * 2 || now - lastFlushTime >= FLUSH_INTERVAL) {
        await flushLogs(topic);
    }
}

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
                // await sendToElasticsearch(logMessage, elastic_index, topic);
                await processQueue(logMessage, elastic_index, topic);
            } catch (error) {
                console.error(`Error processing Kafka message:`, error);
            }
        }
    });
}

async function flushLogs(topic) {
    if (queue.length === 0) return;

    const esClient = createElasticsearchClient(topic);
    const bulkBody = queue.splice(0);
    lastFlushTime = Date.now();

    try {
        const response = await esClient.bulk({ body: bulkBody });

        if (response.errors) {
            console.error("Elasticsearch bulk indexing errors:", response.items);
        } else {
            console.log(`Successfully indexed ${bulkBody.length / 2} documents.`);
        }
    } catch (error) {
        console.error("Bulk indexing error:", error.meta?.body || error);
        // queue.unshift(...bulkBody);
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
