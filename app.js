var express = require("express");
var dotenv = require("dotenv");
var app = express();
dotenv.config();

app.use(express.json());

const routes = require('./src/config/routes');
app.use('/kafka', routes);

const { startFALogConsumerJob, startSseLogConsumerJob } = require('./src/jobs/consumerJob');
(async () => {
    try {
        await Promise.all([startFALogConsumerJob(), startSseLogConsumerJob()]);
    } catch (err) {
        console.error('Error starting consumer jobs:', err);
    }
})();

app.listen(process.env.PORT,function(){
    console.log("serving...");
});