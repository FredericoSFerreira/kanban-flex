export const up = async (db, client) => {
    await db.collection('boards').createIndex({email: 1});
    await db.collection('otp').createIndex({ email: 1, code: 1 });
};

export const down = async (db, client) => {
};
