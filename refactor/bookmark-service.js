const bookmarkService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks');
  }
};
