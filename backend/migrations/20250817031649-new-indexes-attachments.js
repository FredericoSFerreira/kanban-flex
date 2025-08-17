export const up = async (db, client) => {
  await db.collection('attachments').createIndex({boardId: 1, itemId:1});
};

export const down = async (db, client) => {
};
