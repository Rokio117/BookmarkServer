const bookmarkService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks');
  },
  getBookmarkById(knex, id) {
    return knex
      .select('*')
      .from('bookmarks')
      .where({ id: id })
      .first();
  },
  postBookmark(knex, newArticle) {
    return knex
      .insert(newArticle)
      .into('bookmarks')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks')
      .where({ id })
      .delete();
  }
};

module.exports = bookmarkService;
