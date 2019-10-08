const express = require('express');
const uuid = require('uuid');
const logger = require('../logger');

const idRouter = express.Router();
const bookmarkService = require('../../refactor/bookmark-service');
const knex = require('knex');

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

  .delete((req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const knex = req.app.get('db');
    // const bookmark = bookmarks.find(bm => bm.id == id);
    // if (bookmark === -1) {
    //   logger.error(`Bookmark with id ${id} not found`);
    //   return res.status(404).send('Not Found');
    // }
    bookmarkService.deleteBookmark(knex, id);
    logger.info(`Bookmark with id ${id} deleted`);
    res.status(204).end();
  });

module.exports = idRouter;
