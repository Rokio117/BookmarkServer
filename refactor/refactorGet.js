const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('../src/config');
const app = express();
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
const BookmarkService = require('./bookmark-service');

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const db = knex({
  client: 'pg',
  connection: DB_url
});

app.set('db', db);

app.get('/bookmarks', (req, res, next) => {
  const knexInstance = req.app.get('db');
  BookmarkService.getAllBookmarks(knexInstance).then(bookmarks => {
    res.json(bookmarks);
  });
});
