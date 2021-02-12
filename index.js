const express = require('express');
const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config();

const router = require('./router');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/GymingDb', {useNewUrlParser: true, useUnifiedTopology: true}).catch(error => {
mongoose.connect('mongodb://gyming:Gyming.Gym_Online@mongo:27017/admin', {useNewUrlParser: true, useUnifiedTopology: true}).catch(error => {
    console.log('Rejected To Connect To Mongo -> ', error)
});

const app = express();

const options = {
    key: fs.readFileSync(__dirname + '/privkey.pem'),
    cert: fs.readFileSync(__dirname + '/fullchain.pem'),
};

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const port = process.env.PORT || 1357;
const server = http.createServer(options, app);
router(app);

module.exports = app;

server.listen(port);
console.log('Server Running On Port -> ', port);
