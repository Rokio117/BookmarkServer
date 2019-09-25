const express = require('express');
const uuid = require('uuid');
const logger = require('../logger');
const bookmarks = require('../store');
const getRouter = express.Router();

getRouter.route('/bookmarks').get((req, res) => {
  console.log(bookmarks);
  res.send(bookmarks);
});

module.exports = getRouter;
