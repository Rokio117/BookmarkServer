const express = require('express');
const uuid = require('uuid');
const logger = require('../logger');
const bookmarks = require('../store');
const getRouter = express.Router();
const bookmarkService = require('../../refactor/bookmark-service');
const app = require('../app');
const bodyParser = express.json();
const knex = require('knex');
const xss = require('xss');

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating)
});

getRouter
  .route('/bookmarks')
  .get((req, res) => {
    console.log('getrouter ran');
    bookmarkService.getAllBookmarks(req.app.get('db')).then(bookmarks => {
      res.json(bookmarks);
    });
  })
  .post(bodyParser, (req, res) => {
    // TODO: update to use db
    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send(`'${field}' is required`);
      }
    }
    const { title, url, description, rating } = req.body;

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating '${rating}' supplied`);
      return res.status(400).send(`'rating' must be a number between 0 and 5`);
    }

    if (!url.includes('http' || 'https')) {
      logger.error(`Invalid url '${url}' supplied`);
      return res.status(400).send(`'url' must be a valid URL`);
    }

    const bookmark = { id: uuid(), title, url, description, rating };
    bookmarkService.postBookmark(req.app.get('db'), bookmark).then(bookmark => {
      res
        .status(201)
        .location(`/bookmarks/${bookmark.id}`)
        .json(serializeBookmark(bookmark));
    });
  });

module.exports = getRouter;
