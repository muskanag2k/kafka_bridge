var express = require("express");
var dotenv = require("dotenv");
var app = express();
dotenv.config();

app.use(express.json());

const kafkaRoutes = require('./src/routes/kafkaRoutes');
app.use('/kafka', kafkaRoutes);

const { startConsumerJob } = require('./src/jobs/consumerJob');
startConsumerJob();

app.listen(process.env.PORT,function(){
    console.log("serving...");
});