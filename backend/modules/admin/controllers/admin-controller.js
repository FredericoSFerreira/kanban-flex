import { getDb } from '../../../service/mongo-service.js';

const getAllUsers = async (req, res) => {
  try {
    const db = await getDb();
    const users = await db
      .collection('otp')
      .find({})
      .sort({ _created_at: -1 })
      .toArray();

    const safe = users.map((u) => ({
      id: u._id.toString(),   // Parse stores _id as plain string — never use ObjectId here
      name: u.name,
      email: u.email,
      phone: u.phone || null,
      avatar: u.avatar || null,
      active: u.active !== false,
      isAdmin: u.isAdmin || false,
      createdAt: u._created_at || u.createdAt || null,
    }));

    res.status(200).json(safe);
  } catch (e) {
    console.error('Error in admin getAllUsers:', e);
    res.status(500).send('Error fetching users');
  }
};

const getAllBoards = async (req, res) => {
  try {
    const db = await getDb();
    const boards = await db
      .collection('boards')
      .find({})
      .sort({ _created_at: -1 })
      .toArray();

    const result = boards.map((b) => {
      const columns = b.columns || [];
      const totalCards = columns.reduce(
        (acc, col) => acc + (col.itens?.length || 0),
        0
      );
      return {
        id: b._id.toString(),
        name: b.name,
        owner_email: b.owner_email || null,
        owner_id: b.owner_id || null,
        is_public: b.is_public !== false,
        totalColumns: columns.length,
        totalCards,
        members: b.members || [],
        createdAt: b._created_at || b.createdAt || null,
      };
    });

    res.status(200).json(result);
  } catch (e) {
    console.error('Error in admin getAllBoards:', e);
    res.status(500).send('Error fetching boards');
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ msg: 'active must be a boolean' });
    }

    const db = await getDb();

    // Parse _id is a plain string — never use new ObjectId() here
    const user = await db.collection('otp').findOne({ _id: id });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.isAdmin && !active) {
      return res.status(403).json({ msg: 'Cannot deactivate an admin user' });
    }

    await db
      .collection('otp')
      .updateOne({ _id: id }, { $set: { active } });

    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Error in admin toggleUserActive:', e);
    res.status(500).send('Error updating user');
  }
};

export { getAllUsers, getAllBoards, toggleUserActive };
