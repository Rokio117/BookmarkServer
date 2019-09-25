const express = require('express');
const uuid = require('uuid');
const logger = require('../logger');
//const { bookmarks } = require('../store');
const getRouter = express.Router();

getRouter.route('/').get((req, res) => {
  res.send('Hello World');
});

module.exports = getRouter;
