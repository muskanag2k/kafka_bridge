const { Kafka, logLevel } = require('kafkajs');
const fs = require('fs');

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.BROKER_1],
    ssl: {
        rejectUnauthorized: false, // Set to false only for debugging
        ca: [fs.readFileSync(process.env.CA_PEM)],
        key: fs.readFileSync(process.env.CLIENT_KEY),
        cert: fs.readFileSync(process.env.CLIENT_CERT),
        passphrase: process.env.PASSWORD,
      },
});

module.exports = { kafka, logLevel };
