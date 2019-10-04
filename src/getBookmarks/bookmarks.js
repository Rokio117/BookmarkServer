const express = require('express');
const uuid = require('uuid');
const logger = require('../logger');
const bookmarks = require('../store');
const getRouter = express.Router();
const bookmarkService = require('../../refactor/bookmark-service');
const app = require('../app');

getRouter.route('/bookmarks').get((req, res) => {
  console.log('getrouter ran');
  bookmarkService.getAllBookmarks(req.app.get('db')).then(bookmarks => {
    res.json(bookmarks);
  });
});

module.exports = getRouter;
