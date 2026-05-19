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

const getDashboardUsersStats = async (req, res) => {
  try {
    const db = await getDb();
    const total = await db.collection('otp').countDocuments();
    const active = await db.collection('otp').countDocuments({ active: { $ne: false } });
    const admins = await db.collection('otp').countDocuments({ isAdmin: true });
    res.status(200).json({ total, active, inactive: total - active, admins });
  } catch (e) {
    console.error('Error in getDashboardUsersStats:', e);
    res.status(500).send('Error fetching users stats');
  }
};

const getDashboardBoardsStats = async (req, res) => {
  try {
    const db = await getDb();
    const boards = await db.collection('boards').find({}).toArray();
    const total = boards.length;
    const publicCount = boards.filter(b => b.is_public !== false).length;
    const totalCards = boards.reduce((acc, b) => {
      const columns = b.columns || [];
      return acc + columns.reduce((cAcc, col) => cAcc + (col.itens?.length || 0), 0);
    }, 0);
    res.status(200).json({ total, public: publicCount, private: total - publicCount, totalCards });
  } catch (e) {
    console.error('Error in getDashboardBoardsStats:', e);
    res.status(500).send('Error fetching boards stats');
  }
};

const getDashboardGrowth = async (req, res) => {
  try {
    const db = await getDb();
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }

    const usersByMonth = [];
    const boardsByMonth = [];

    for (const m of months) {
      const start = new Date(m.year, m.month - 1, 1);
      const end = new Date(m.year, m.month, 1);
      const userCount = await db.collection('otp').countDocuments({
        _created_at: { $gte: start, $lt: end },
      });
      const boardCount = await db.collection('boards').countDocuments({
        _created_at: { $gte: start, $lt: end },
      });
      usersByMonth.push({ label: m.label, count: userCount });
      boardsByMonth.push({ label: m.label, count: boardCount });
    }

    res.status(200).json({ usersByMonth, boardsByMonth });
  } catch (e) {
    console.error('Error in getDashboardGrowth:', e);
    res.status(500).send('Error fetching growth data');
  }
};

const getDashboardTopBoards = async (req, res) => {
  try {
    const db = await getDb();
    const boards = await db.collection('boards').find({}).toArray();
    const mapped = boards.map((b) => {
      const columns = b.columns || [];
      const totalCards = columns.reduce((acc, col) => acc + (col.itens?.length || 0), 0);
      return {
        id: b._id.toString(),
        name: b.name,
        totalCards,
        totalColumns: columns.length,
        owner_email: b.owner_email || null,
      };
    });
    mapped.sort((a, b) => b.totalCards - a.totalCards);
    res.status(200).json(mapped.slice(0, 5));
  } catch (e) {
    console.error('Error in getDashboardTopBoards:', e);
    res.status(500).send('Error fetching top boards');
  }
};

const toggleUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ msg: 'isAdmin must be a boolean' });
    }

    const db = await getDb();
    const user = await db.collection('otp').findOne({ _id: id });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    await db.collection('otp').updateOne({ _id: id }, { $set: { isAdmin } });
    res.status(200).json({ success: true, isAdmin });
  } catch (e) {
    console.error('Error in toggleUserAdmin:', e);
    res.status(500).send('Error updating user admin status');
  }
};

const getDashboardActivityHeatmap = async (req, res) => {
  try {
    const db = await getDb();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const logs = await db.collection('accessLog')
      .find({ _created_at: { $gte: start } })
      .toArray();

    const heatmap = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    logs.forEach((log) => {
      const d = new Date(log._created_at);
      const day = d.getDay();
      const hour = d.getHours();
      heatmap[day][hour]++;
    });

    res.status(200).json({ heatmap });
  } catch (e) {
    console.error('Error in getDashboardActivityHeatmap:', e);
    res.status(500).send('Error fetching activity heatmap');
  }
};

const getDashboardEngagement = async (req, res) => {
  try {
    const db = await getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const boards = await db.collection('boards').find({}).toArray();

    let active = 0;
    let inactive = 0;

    boards.forEach((b) => {
      const columns = b.columns || [];
      const hasRecentActivity = columns.some((col) => {
        const items = col.itens || [];
        return items.some((item) => {
          const itemDate = item.createdAt || item.updatedAt || b._created_at;
          if (!itemDate) return false;
          return new Date(itemDate) >= thirtyDaysAgo;
        });
      });
      if (hasRecentActivity) active++;
      else inactive++;
    });

    res.status(200).json({ active, inactive, total: boards.length });
  } catch (e) {
    console.error('Error in getDashboardEngagement:', e);
    res.status(500).send('Error fetching engagement data');
  }
};

const getDashboardColumnDistribution = async (req, res) => {
  try {
    const db = await getDb();
    const boards = await db.collection('boards').find({}).toArray();
    const columnMap = {};

    boards.forEach((b) => {
      const columns = b.columns || [];
      columns.forEach((col) => {
        const name = col.name || 'Sem nome';
        const count = col.itens?.length || 0;
        if (!columnMap[name]) columnMap[name] = { total: 0, count: 0 };
        columnMap[name].total += count;
        columnMap[name].count += 1;
      });
    });

    const result = Object.entries(columnMap).map(([name, data]) => ({
      name,
      avgCards: Math.round((data.total / data.count) * 10) / 10,
      totalCards: data.total,
    }));

    res.status(200).json(result);
  } catch (e) {
    console.error('Error in getDashboardColumnDistribution:', e);
    res.status(500).send('Error fetching column distribution');
  }
};

const getDashboardAttachmentsGrowth = async (req, res) => {
  try {
    const db = await getDb();
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }

    const attachmentsByMonth = [];
    const storageByMonth = [];

    for (const m of months) {
      const start = new Date(m.year, m.month - 1, 1);
      const end = new Date(m.year, m.month, 1);
      const items = await db.collection('attachments').find({
        _created_at: { $gte: start, $lt: end },
      }).toArray();
      const totalSize = items.reduce((acc, item) => acc + (item.size || 0), 0);
      attachmentsByMonth.push({ label: m.label, count: items.length });
      storageByMonth.push({ label: m.label, size: Math.round(totalSize / 1024 / 1024 * 10) / 10 }); // MB
    }

    res.status(200).json({ attachmentsByMonth, storageByMonth });
  } catch (e) {
    console.error('Error in getDashboardAttachmentsGrowth:', e);
    res.status(500).send('Error fetching attachments growth');
  }
};

const getDashboardVisibilityTrend = async (req, res) => {
  try {
    const db = await getDb();
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }

    const publicByMonth = [];
    const privateByMonth = [];

    for (const m of months) {
      const start = new Date(m.year, m.month - 1, 1);
      const end = new Date(m.year, m.month, 1);
      const publicCount = await db.collection('boards').countDocuments({
        _created_at: { $gte: start, $lt: end },
        is_public: { $ne: false },
      });
      const privateCount = await db.collection('boards').countDocuments({
        _created_at: { $gte: start, $lt: end },
        is_public: false,
      });
      publicByMonth.push({ label: m.label, count: publicCount });
      privateByMonth.push({ label: m.label, count: privateCount });
    }

    res.status(200).json({ publicByMonth, privateByMonth });
  } catch (e) {
    console.error('Error in getDashboardVisibilityTrend:', e);
    res.status(500).send('Error fetching visibility trend');
  }
};

const getDashboardLoginMethods = async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.collection('otp').find({}).toArray();
    let email = 0;
    let google = 0;

    users.forEach((u) => {
      if (u.code && u.code.length === 6) email++;
      else if (u.avatar && u.avatar.includes('google')) google++;
      else email++;
    });

    res.status(200).json({ email, google, total: users.length });
  } catch (e) {
    console.error('Error in getDashboardLoginMethods:', e);
    res.status(500).send('Error fetching login methods');
  }
};

const getDashboardInviteFunnel = async (req, res) => {
  try {
    const db = await getDb();
    const total = await db.collection('boardInvites').countDocuments();
    const used = await db.collection('boardInvites').countDocuments({ used: true });
    const expired = await db.collection('boardInvites').countDocuments({
      used: false,
      expiresAt: { $lt: new Date() },
    });
    res.status(200).json({ total, used, expired, pending: total - used - expired });
  } catch (e) {
    console.error('Error in getDashboardInviteFunnel:', e);
    res.status(500).send('Error fetching invite funnel');
  }
};

const getDashboardMostEngagedBoards = async (req, res) => {
  try {
    const db = await getDb();
    const boards = await db.collection('boards').find({}).toArray();
    const mapped = boards.map((b) => {
      const columns = b.columns || [];
      let totalComments = 0;
      let totalVotes = 0;
      const totalCards = columns.reduce((acc, col) => {
        const items = col.itens || [];
        items.forEach((item) => {
          totalComments += item.comments?.length || 0;
          totalVotes += (item.up_vote || 0) + (item.down_vote || 0);
        });
        return acc + items.length;
      }, 0);
      return {
        id: b._id.toString(),
        name: b.name,
        totalCards,
        totalComments,
        totalVotes,
        totalMembers: (b.members || []).length,
        engagementScore: totalCards + totalComments * 2 + totalVotes,
      };
    });
    mapped.sort((a, b) => b.engagementScore - a.engagementScore);
    res.status(200).json(mapped.slice(0, 5));
  } catch (e) {
    console.error('Error in getDashboardMostEngagedBoards:', e);
    res.status(500).send('Error fetching most engaged boards');
  }
};

export {
  getAllUsers,
  getAllBoards,
  toggleUserActive,
  toggleUserAdmin,
  getDashboardUsersStats,
  getDashboardBoardsStats,
  getDashboardGrowth,
  getDashboardTopBoards,
  getDashboardActivityHeatmap,
  getDashboardEngagement,
  getDashboardColumnDistribution,
  getDashboardAttachmentsGrowth,
  getDashboardVisibilityTrend,
  getDashboardLoginMethods,
  getDashboardInviteFunnel,
  getDashboardMostEngagedBoards,
};
