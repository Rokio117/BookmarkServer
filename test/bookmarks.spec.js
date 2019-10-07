const { expect } = require('chai');
const testBookmarks = require('./testBookmarks');
const knex = require('knex');

const app = require('../src/app');

describe('Bookmarks Endpoints', function() {
  const testbm = testBookmarks();
  console.log(testBookmarks());
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
    context('Given no authorization', () => {
      it(`will return 401`, () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(401);
      });
    });
    context('with autorization', () => {
      const testBookmarks = [
        {
          title: 'Big',
          url: 'www.big.com',
          description: 'such big very wow',
          rating: 5
        },
        {
          title: 'Shok',
          url: 'www.shok.com',
          description: 'big shok much very so',
          rating: 4
        },
        {
          title: 'Quick math',
          url: 'www.quickMath.com',
          description: '2+2=4-1 thats 3 QUICK MATH',
          rating: 3
        },
        {
          title: 'O tah eesh knee',
          url: 'www.otah.com',
          description: 'It doesnt have to make sense',
          rating: 4
        },
        {
          title: 'ting go shrkrkroseoraaaah',
          url: 'www.tingoesskra.com',
          description: 'papa ka ka ka',
          rating: 5
        }
      ];
      const testBookmark = {
        title: 'Big',
        url: 'www.big.com',
        description: 'such big very wow',
        rating: 5
      };
      before('insert articles', () => {
        return db.into('bookmarks').insert(testBookmark);
      });
      it('will send back all bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmark);
      });
    });
  });
});
