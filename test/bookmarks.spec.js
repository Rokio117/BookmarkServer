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
          .expect(200)
          .expect(res => {
            let result = res.body;
            Object.keys(expectedBookmark).forEach(key => {
              expect(result).to.have.property(key, expectedBookmark[key]);
            });
          });
      });
    });
    context('using wrong information', () => {
      it('will return 404 when id is not found', () => {
        return supertest(app)
          .get(`/bookmarks/800`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404);
      });
    });
  });
  describe('delete /bookmarks/:id', () => {
    const bookmarkId = 3;
    context('given there are bookmarks in the db', () => {
      before('insert bookmarks', () => {
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
  describe.only(`PATCH /bookmarks/:id`, () => {
    context(`Given incorrect id`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 8;

        return supertest(app)
          .patch(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `bookmark does not exist` } });
      });
    });
    context(`Given no changes`, () => {
      it(`responds with 400 and error message`, () => {
        const bookmarkId = 3;
        const body = { title: '', url: '', description: '', rating: '' };
        beforeEach('insert articles', () => {
          return db.into('bookmarks').insert(testBookmarks());
        });
        const expectedArticle = {
          ...testBookmarks()[bookmarkId - 1],
          ...bookmarkId
        };
        return supertest(app)
          .patch(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(body)
          .expect(400, {
            error: {
              message: `Request body must contain either 'title, url, description, or rating.`
            }
          });
      });
    });
  });
});
