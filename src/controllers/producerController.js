const { handlePublish } = require('../services/producerService');
const { validateEvent } = require('../services/validationService');

const publishEvent = async (req, res) => {
    const events = req.body.events;
    if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ message: 'Please provide a valid batch of events' });
    }
    try {
        const topic = `amplitude_events`;
        for (const event of events) {
            validateEvent(event);
            await handlePublish(topic, event);
        }
        res.json({ message: 'Events published successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to publish events' });
    }
};

module.exports = { publishEvent };
