module.exports = {
  async up(db, client) {
    await db.createCollection('boards');
    await db.createCollection('otp')
  },

  async down(db, client) {
  }
};
