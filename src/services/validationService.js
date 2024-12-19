function validateEvent(event) {
    if (!event || typeof event !== 'object') {
        throw new Error('Invalid event format.');
    }
    if (!event.event_name) {
        throw new Error('Event name is required.');
    }
    if (!event.event_properties) {
        throw new Error('Event properties are required.');
    }
}

module.exports = { validateEvent };
