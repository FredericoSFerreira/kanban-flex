export const up = async (db, client) => {
  const limitStorage5GB = 1 * 1024 * 1024 * 1024;

  await db.collection('otp').updateMany(
    {
      usedStorage: {$exists: true},
      limitStorage: {$exists: false}
    },
    {
      $set: {
        limitStorage: limitStorage5GB
      }
    }
  );

  await db.collection('otp').updateMany(
    {
      usedStorage: {$exists: false}
    },
    {
      $set: {
        usedStorage: 0,
        limitStorage: limitStorage5GB
      }
    }
  );
};

export const down = async (db, client) => {
};
