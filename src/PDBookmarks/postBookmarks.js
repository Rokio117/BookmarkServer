const express = require('express');
const logger = require('../logger');
const bookmarks = require('../store');
const postRouter = express.Router();
const uuid = require('uuid/v4');

postRouter.use(express.json());

postRouter.route('/bookmarks').post((req, res) => {
  console.log(req.body);

  const { title, url, description, rating } = req.body;
  console.log(typeof rating);
  const ratings = [1, 2, 3, 4, 5];
  if (!title) {
    return res.status(400).send('Title Required');
  }
  if (title.length < 3 || title.length > 40) {
    return resizeTo
      .status(400)
      .send('title must be between 3 and 40 characters');
  }
  if (!url) {
    return res.status(400).send('Url required');
  }
  if (!url.includes('http' || 'https')) {
    return res.status(400).send('url must have http or https');
  }
  if (!description) {
    return res.status(400).send('Description required');
  }
  if (description.length < 5 || description.length > 60) {
    return res
      .status(400)
      .send('Desctiption must be between 5 and 60 characters.');
  }
  if (!rating) {
    return res.status(400).send('Rating required');
  }
  if (!ratings.includes(rating)) {
    return res.status(400).send('rating must be a number from 1 to 5');
  }

  const id = uuid();
  const newBookmark = {
    id,
    title,
    url,
    description,
    rating
  };
  bookmarks.push(newBookmark);
  res.status(204).location(`http://localhost:8000/bookmarks/${id}`).end;
});

module.exports = postRouter;
