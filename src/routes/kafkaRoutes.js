const express = require('express');
const { publishEvent } = require('../controllers/producerController');
const { consumeMessagesFromTopic } = require('../controllers/consumerController');

const router = express.Router();

router.post('/publish', publishEvent);
router.post('/consume', consumeMessagesFromTopic);

module.exports = router;
