// Kafka producer
const { doesTopicExist, publishMessage } = require('./admin/kafkaHandlerService');

async function handlePublish(topic, event) {
    try {
        const topicExists = await doesTopicExist(topic);
        if (!topicExists) {
            console.log(`Topic "${topic}" does not exist. Creating...`);
            // await createTopic(topic);
        }

        await publishMessage(topic, event);
        return { success: true, topic };
    } catch (error) {
        console.error(`Failed to handle publish for topic "${topic}":`, error);
        throw new Error('Failed to publish message.');
    }
}

module.exports = { handlePublish };