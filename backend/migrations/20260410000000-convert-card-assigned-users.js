export const up = async (db, client) => {
  const boards = await db.collection('boards').find({}).toArray();

  for (const board of boards) {
    let modified = false;
    const columns = board.columns || [];

    for (const col of columns) {
      if (col.itens && Array.isArray(col.itens)) {
        for (const item of col.itens) {
          if (item) {
            if (item.assigned_user) {
              item.assigned_users = [item.assigned_user];
              delete item.assigned_user;
              modified = true;
            }
            if (item.assignedUserId) {
              if (!item.assigned_users) item.assigned_users = [];
              // We don't have the full object here, just string ID, but that's unlikely based on vue code.
              // We'll leave it as fallback if assignedUserId exists.
              item.assigned_users.push({ id: item.assignedUserId, name: 'Assigned User', avatar: '' });
              delete item.assignedUserId;
              modified = true;
            }
          }
        }
      }
    }

    if (modified) {
      await db.collection('boards').updateOne(
        { _id: board._id },
        { $set: { columns: columns } }
      );
    }
  }
};

export const down = async (db, client) => {
  // Not creating a rollback as it could lead to data loss of the other users assigned later
};
