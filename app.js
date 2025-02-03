var express = require("express");
var dotenv = require("dotenv");
var app = express();
dotenv.config();

app.use(express.json());

const routes = require('./src/config/routes');
app.use('/kafka', routes);

const { startConsumerJob, startLogConsumerJob } = require('./src/jobs/consumerJob');
(async () => {
    try {
        await Promise.all([startConsumerJob(), startLogConsumerJob()]);
    } catch (err) {
        console.error('Error starting consumer jobs:', err);
    }
})();

app.listen(process.env.PORT,function(){
    console.log("serving...");
});