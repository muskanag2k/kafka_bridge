const { Kafka, logLevel } = require('kafkajs');
const fs = require('fs');

const kafka = new Kafka({
    clientId: 'middleware-service',
    connectionTimeout: 25000,
    brokers: ['localhost:9092'],
    ssl: {
        rejectUnauthorized: false, // Set to false only for debugging
        ca: [fs.readFileSync('/Users/muskanagarwal/Downloads/kafka_2.13-3.8.1/ssl/ca.pem', 'utf-8')],
        key: fs.readFileSync('/Users/muskanagarwal/Downloads/kafka_2.13-3.8.1/ssl/kafka.client.key.pem'),
        cert: fs.readFileSync('/Users/muskanagarwal/Downloads/kafka_2.13-3.8.1/ssl/kafka.client.cert.pem'),
        passphrase: 'keypass',
      },
});

module.exports = { kafka, logLevel };
