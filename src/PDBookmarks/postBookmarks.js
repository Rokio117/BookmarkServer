const express = require('express');
const logger = require('../logger');
const bookmarks = require('../store');
const postRouter = express.Router();
const uuid = require('uuid/v4');

postRouter.route('/bookmarks').post((req, res) => {
  res.send('Post Request recieved');
});
