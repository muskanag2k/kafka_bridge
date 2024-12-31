var express = require("express");
var dotenv = require("dotenv");
var app = express();
dotenv.config();

app.use(express.json());

const routes = require('./src/config/routes');
app.use('/kafka', routes);

const { startConsumerJob } = require('./src/jobs/consumerJob');
startConsumerJob();

app.listen(process.env.PORT,function(){
    console.log("serving...");
});