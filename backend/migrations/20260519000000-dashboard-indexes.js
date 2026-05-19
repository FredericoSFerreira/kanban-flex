export const up = async (db, client) => {
  // Dashboard growth queries
  await db.collection('otp').createIndex({ _created_at: 1 });
  await db.collection('boards').createIndex({ _created_at: 1 });
  
  // Visibility trend queries
  await db.collection('boards').createIndex({ _created_at: 1, is_public: 1 });
  
  // Attachment growth queries
  await db.collection('attachments').createIndex({ _created_at: 1 });
  
  // Invite funnel queries
  await db.collection('boardInvites').createIndex({ used: 1, expiresAt: 1 });
  
  // Activity heatmap queries
  await db.collection('accessLog').createIndex({ _created_at: 1 });
  
  // Active user queries
  await db.collection('otp').createIndex({ active: 1 });
  await db.collection('otp').createIndex({ isAdmin: 1 });
};

export const down = async (db, client) => {
  await db.collection('otp').dropIndex({ _created_at: 1 });
  await db.collection('boards').dropIndex({ _created_at: 1 });
  await db.collection('boards').dropIndex({ _created_at: 1, is_public: 1 });
  await db.collection('attachments').dropIndex({ _created_at: 1 });
  await db.collection('boardInvites').dropIndex({ used: 1, expiresAt: 1 });
  await db.collection('accessLog').dropIndex({ _created_at: 1 });
  await db.collection('otp').dropIndex({ active: 1 });
  await db.collection('otp').dropIndex({ isAdmin: 1 });
};
