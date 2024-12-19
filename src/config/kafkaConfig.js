const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'middleware-service',
    ssl: undefined,
    connectionTimeout: 25000,
    brokers: ['localhost:9092'],
});

module.exports = kafka;
