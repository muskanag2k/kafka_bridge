const { consumeMessages } = require('../services/consumers/consumerService');

const consumeMessagesFromTopic = async (req, res) => {
    try {
        consumeMessages();
        res.json({ message: `Consuming messages...."` });
    } catch (err) {
        console.error('Error while consuming messages:', err);
        res.status(500).json({ message: 'Failed to consume messages', error: err.message });
    }
};

module.exports = { consumeMessagesFromTopic };
