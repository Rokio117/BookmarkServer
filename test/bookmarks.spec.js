const { expect } = require('chai');
const knex = require('knex');
const { testBookmarks } = require('./testBookmarks');
const app = require('../refactor/refactorGet');

describe('Bookmarks Endpoints', function() {
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    //app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());
  before('clear the table', () => db('bookmarks').truncate());
  afterEach('cleanup', () => db('bookmarks').truncate());

  describe(` GET /bookmarks`, () => {
    context('Given bookmarks', () => {
      it(`doesn't explode`, () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200);
      });
    });
  });
});
