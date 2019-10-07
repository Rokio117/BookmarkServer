const express = require('express');
const uuid = require('uuid');
const logger = require('../logger');
const bookmarks = require('../store');
const idRouter = express.Router();
const bookmarkService = require('../../refactor/bookmark-service');
const knex = require('knex');
const bodyParser = express.json();

idRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const knex = req.app.get('db');
    bookmarkService.getBookmarkById(req.app.get('db'), id).then(bookmark => {
      if (!bookmark) {
        logger.error(`Bookmark with id ${id} not found`);
        return res.status(404).send('List not found');
      }
      res.json(bookmark);
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

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      return res.status(400).send(`'url' must be a valid URL`);
    }

    const bookmark = { id: uuid(), title, url, description, rating };
    bookmarkService.postBookmark(knex, bookmark);
  })
  .delete((req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const bookmark = bookmarks.find(bm => bm.id == id);
    if (bookmark === -1) {
      logger.error(`Bookmark with id ${id} not found`);
      return res.status(404).send('Not Found');
    }
    bookmarks.splice(bookmark, 1);
    logger.info(`Bookmark with id ${id} deleted`);
    res.status(204).end();
  });

module.exports = idRouter;
