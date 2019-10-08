const { expect } = require('chai');
const testBookmarks = require('./testBookmarks');
const knex = require('knex');

const app = require('../src/app');

describe('Bookmarks Endpoints', function() {
  const testbm = testBookmarks();
  console.log(testBookmarks());
  let db;
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());
  before('clear the table', () => db('bookmarks').truncate());
  afterEach('cleanup', () => db('bookmarks').truncate());

  describe.only(` GET /bookmarks`, () => {
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
          url: 'http://www.big.com',
          description: 'such big very wow',
          rating: 5
        },
        {
          title: 'Shok',
          url: 'http://www.shok.com',
          description: 'big shok much very so',
          rating: 4
        },
        {
          title: 'Quick math',
          url: 'http://www.quickMath.com',
          description: '2+2=4-1 thats 3 QUICK MATH',
          rating: 3
        },
        {
          title: 'O tah eesh knee',
          url: 'http://www.otah.com',
          description: 'It doesnt have to make sense',
          rating: 4
        },
        {
          title: 'http://ting go shrkrkroseoraaaah',
          url: 'www.tingoesskra.com',
          description: 'papa ka ka ka',
          rating: 5
        }
      ];
      const testBookmark = {
        title: 'Big',
        url: 'http://www.big.com',
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
          .expect(200)
          .expect(res => {
            let result = res.body[0];
            Object.keys(testBookmark).forEach(key => {
              expect(result).to.have.property(key, testBookmark[key]);
            });
          });
      });
    });
  });
  describe('/bookmarks/:id', () => {
    const bookMarkid = 3;
    const expectedBookmark = testBookmarks()[2];
    context('given no authorization', () => {
      it('will return 401', () => {
        return supertest(app)
          .get(`/bookmarks/${bookMarkid}`)
          .expect(401);
      });
    });
    context('with authorization and real id', () => {
      before('insert test bookmarks', () => {
        return db.into('bookmarks').insert(testBookmarks());
      });
      it('will return the correct bookmark', () => {
        return supertest(app)
          .get(`/bookmarks/${bookMarkid}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark);
      });
    });
    context('given no bookmarks exist', () => {
      it('will return empty array when no bookmarks exist', () => {
        return supertest(app)
          .get(`/bookmarks/${bookMarkid}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });
  });
  describe('delete /bookmarks/:id', () => {
    const bookmarkId = 3;
    context('given there are bookmarks in the db', () => {
      beforeEach('insert bookmarks', () => {
        return db.into('bookmarks').insert(testBookmarks);
      });
      it('responds with 204 and delets the bookmark', () => {
        const expectedResults = testBookmarks().filter(
          bookmark => bookmark.id !== bookmarkId
        );
        return supertest(app)
          .delete(`/articles/${bookmarkId}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/articles`)
              .expect(expectedResults);
          });
      });
    });
  });
});
