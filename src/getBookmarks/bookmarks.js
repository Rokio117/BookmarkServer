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
const idRouter = express.Router();

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
  .post(bodyParser, (req, res, next) => {
    console.log(req.body);
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

    const newBookmark = { title, url, description, rating };

    bookmarkService
      .postBookmark(req.app.get('db'), newBookmark)
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });

idRouter
  .route('/bookmarks/:id')
  .all((req, res, next) => {
    bookmarkService
      .getBookmarkById(req.app.get('db'), req.params.id)
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: 'bookmark does not exist' }
          });
        } else next();
      })
      .catch(next);
  })
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
  .patch(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const bookmarkToUpdate = { title, url, description, rating };
    const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean)
      .length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title, url, description, or rating.`
        }
      });
    }
    bookmarkService
      .patchBookmark(req.app.get('db'), req.params.id, bookmarkToUpdate)
      .catch(next)
      .then(value => {
        res.json(value);
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
    bookmarkService.deleteBookmark(knex, id).then(() => {
      logger.info(`Bookmark with id ${id} deleted`);
      res.status(204).end();
    });
  });

module.exports = { getRouter, idRouter };
