//to validate/create topic based on the event type
const { kafka, logLevel } = require('../../config/kafkaConfig');

const admin = kafka.admin();
const producer = kafka.producer();

async function doesTopicExist(topicName) {
    try {
        await admin.connect();
        const topics = await admin.listTopics();
        return topics.includes(topicName);
    } catch (error) {
        console.error(`Error checking topic "${topicName}":`, error);
        throw new Error('Error checking topic existence.');
    } finally {
        await admin.disconnect();
    }
}

// async function createTopic(topicName) {
//     try {
//         await admin.connect();
//         await admin.createTopics({
//             topics: [{ topic: topicName }],
//         });
//         console.log(`Topic "${topicName}" created successfully.`);
//     } catch (error) {
//         if (error.message.includes('TopicExistsException')) {
//             console.log(`Topic "${topicName}" already exists.`);
//         } else {
//             console.error(`Error creating topic "${topicName}":`, error);
//             throw new Error('Error creating Kafka topic.');
//         }
//     } finally {
//         await admin.disconnect();
//     }
// }

async function publishMessage(topic, message) {
    try {
        if (!topic) {
            throw new Error('Topic is undefined or empty');
        }
        await producer.disconnect();
        await producer.connect();
        const result = await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        console.log("message published to:", message.event_name, result);
    } catch (error) {
        console.error(`Error publishing message to topic "${topic}":`, error);
        throw new Error('Error publishing message to Kafka.');
    } finally {
        await producer.disconnect();
    }
}

module.exports = { doesTopicExist, publishMessage };
