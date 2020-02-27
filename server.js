const express = require('express');

const authRouter = require('./users/userRouter.js');

const server = express();
server.use(express.json());
server.use('/api', authRouter);

module.exports = server;