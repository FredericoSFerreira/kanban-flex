export const up = async (db, client) => {
  await db.collection('activityLog').createIndex({ _created_at: -1 });
  await db.collection('activityLog').createIndex({ boardId: 1, _created_at: -1 });
  await db.collection('activityLog').createIndex({ action: 1, _created_at: -1 });
  await db.collection('boardInvites').createIndex({ _created_at: -1 });
};

export const down = async (db, client) => {
  await db.collection('activityLog').dropIndex({ _created_at: -1 });
  await db.collection('activityLog').dropIndex({ boardId: 1, _created_at: -1 });
  await db.collection('activityLog').dropIndex({ action: 1, _created_at: -1 });
  await db.collection('boardInvites').dropIndex({ _created_at: -1 });
};
