const express = require('express');
const uuid = require('uuid');
const logger = require('../logger');
const bookmarks = require('../store');
const idRouter = express.Router();

idRouter
  .route('/bookmarks:id')
  .get((req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const bookmark = bookmarks.find(bm => bm.id == id);
    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found`);
      return res.status(404).send('List not found');
    }
    res.send(bookmark);
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
