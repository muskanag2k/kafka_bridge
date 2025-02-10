const { Kafka, logLevel } = require('kafkajs');
// const fs = require('fs');

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.BROKER_1, process.env.BROKER_2, process.env.BROKER_3, process.env.BROKER_4, process.env.BROKER_5, process.env.BROKER_6, process.env.BROKER_7],
    ssl: undefined,
    // ssl: {
    //     rejectUnauthorized: false, // Set to false only for debugging
    //     ca: [fs.readFileSync(process.env.CA_PEM)],
    //     key: fs.readFileSync(process.env.CLIENT_KEY),
    //     cert: fs.readFileSync(process.env.CLIENT_CERT),
    //     passphrase: process.env.PASSWORD,
    //   },
});

module.exports = { kafka, logLevel };
