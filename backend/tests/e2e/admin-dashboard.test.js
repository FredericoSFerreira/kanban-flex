const mockCallFunction = jest.fn();

jest.unstable_mockModule('./utils/parse-utils.js', () => ({
  callFunction: mockCallFunction
}));

jest.unstable_mockModule('./middleware/auth.js', () => ({
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({msg: 'Token not pass'});
    }
    req.user = {id: 'mock-user-id', name: 'Mock User'};
    req.token = 'fake-token';
    next();
  },
  verifyAdmin: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({msg: 'Token not pass'});
    }
    req.user = {id: 'mock-admin-id', name: 'Mock Admin', isAdmin: true};
    req.token = 'fake-token';
    next();
  }
}));

// Mock MongoDB service
const mockCollection = jest.fn();
const mockDb = {
  collection: mockCollection
};

jest.unstable_mockModule('./service/mongo-service.js', () => ({
  getDb: jest.fn().mockResolvedValue(mockDb)
}));

const mockSendEmail = jest.fn();
jest.unstable_mockModule('./service/email-service.js', () => ({
  default: mockSendEmail
}));

const mockUploadFileToS3 = jest.fn().mockResolvedValue({ url: 'https://s3.test/file.pdf' });
const mockDeleteFileFromS3 = jest.fn();
const mockGeneratePresignedUrl = jest.fn().mockResolvedValue('https://presigned.test/file.pdf');
jest.unstable_mockModule('./service/s3-service.js', () => ({
  uploadFileToS3: mockUploadFileToS3,
  deleteFileFromS3: mockDeleteFileFromS3,
  generatePresignedUrl: mockGeneratePresignedUrl,
}));

const request = (await import('supertest')).default;
const {default: app} = await import('../../app.js');

// Mock Parse for resendInvite
global.Parse = {
  Query: jest.fn().mockImplementation((className) => ({
    get: jest.fn().mockImplementation((id) => {
      if (className === 'boards') {
        return Promise.resolve({ get: (field) => field === 'name' ? 'Board A' : undefined });
      }
      if (className === 'otp') {
        return Promise.resolve({ get: (field) => field === 'name' ? 'Admin User' : undefined });
      }
      return Promise.resolve(null);
    }),
  })),
};

beforeAll(() => {
  process.env.FRONT_HOST = 'http://localhost:5173';
});

// Mock data
const mockUsers = [
  { _id: 'user1', name: 'João', email: 'joao@test.com', active: true, isAdmin: true, _created_at: new Date('2025-01-15'), code: '123456' },
  { _id: 'user2', name: 'Maria', email: 'maria@test.com', active: true, isAdmin: false, _created_at: new Date('2025-02-20'), code: '654321' },
  { _id: 'user3', name: 'Pedro', email: 'pedro@test.com', active: false, isAdmin: false, _created_at: new Date('2025-03-10') },
  { _id: 'user4', name: 'Google User', email: 'google@test.com', active: true, isAdmin: false, _created_at: new Date('2025-04-05'), avatar: 'https://lh3.googleusercontent.com/photo.jpg' },
];

const mockBoards = [
  { _id: 'board1', name: 'Board A', is_public: true, owner_email: 'joao@test.com', columns: [
    { name: 'To Do', itens: [
      { title: 'Task 1', createdAt: new Date(), comments: [{ text: 'ok' }], up_vote: 5, down_vote: 1 },
      { title: 'Task 2', createdAt: new Date(), comments: [], up_vote: 2, down_vote: 0 }
    ]},
    { name: 'Done', itens: [
      { title: 'Task 3', createdAt: new Date('2024-01-01'), comments: [{ text: 'done' }, { text: 'thanks' }], up_vote: 3, down_vote: 0 }
    ]}
  ], members: [{ userId: 'user1', email: 'joao@test.com' }], _created_at: new Date('2025-01-20') },
  { _id: 'board2', name: 'Board B', is_public: false, owner_email: 'maria@test.com', columns: [
    { name: 'Backlog', itens: [] },
    { name: 'In Progress', itens: [
      { title: 'Task 4', createdAt: new Date(), comments: [], up_vote: 1, down_vote: 0 }
    ]}
  ], members: [{ userId: 'user1', email: 'joao@test.com' }, { userId: 'user2', email: 'maria@test.com' }], _created_at: new Date('2025-02-25') },
];

const mockAccessLogs = [
  { _id: 'log1', id_user: 'user1', action: 'login', ip: '127.0.0.1', browser: 'Chrome', _created_at: new Date() },
  { _id: 'log2', id_user: 'user2', action: 'register', ip: '127.0.0.1', browser: 'Firefox', _created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) },
];

const mockAttachments = [
  { _id: 'att1', name: 'file1.pdf', size: 1024000, boardId: 'board1', itemId: 'item1', _created_at: new Date() },
  { _id: 'att2', name: 'file2.png', size: 2048000, boardId: 'board1', itemId: 'item2', _created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) },
];

const mockActivityLog = [
  { _id: 'act1', userId: 'user1', userName: 'João', userAvatar: null, action: 'create_card', boardId: 'board1', boardName: 'Board A', cardId: 'card1', cardTitle: 'Task 1', details: 'Criou o cartão Task 1', _created_at: new Date() },
  { _id: 'act2', userId: 'user2', userName: 'Maria', userAvatar: null, action: 'move_card', boardId: 'board2', boardName: 'Board B', cardId: 'card2', cardTitle: 'Task 4', details: 'Moveu cartão Task 4 para Done', _created_at: new Date(Date.now() - 3600000) },
];

const mockInvites = [
  { _id: 'inv1', email: 'convidado@test.com', boardId: 'board1', invitedBy: 'user1', used: true, token: 'token-abc-123', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), _created_at: new Date() },
  { _id: 'inv2', email: 'pendente@test.com', boardId: 'board1', invitedBy: 'user1', used: false, token: 'token-def-456', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), _created_at: new Date() },
  { _id: 'inv3', email: 'expirado@test.com', boardId: 'board2', invitedBy: 'user2', used: false, token: 'token-ghi-789', expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), _created_at: new Date() },
];

// Helper to create mock collection with find/count/update operations
function createMockCollection(docs) {
  return {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue(docs),
    }),
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(docs),
    }),
    countDocuments: jest.fn().mockImplementation((query = {}) => {
      // Simple filtering logic for tests
      if (!query || Object.keys(query).length === 0) return Promise.resolve(docs.length);
      
      let count = 0;
      for (const doc of docs) {
        let match = true;
        for (const [key, value] of Object.entries(query)) {
          if (key === '_created_at' && value && typeof value === 'object') {
            const docDate = new Date(doc._created_at);
            if (value.$gte && docDate < value.$gte) match = false;
            if (value.$lt && docDate >= value.$lt) match = false;
          } else if (doc[key] !== value) {
            match = false;
          }
        }
        if (match) count++;
      }
      return Promise.resolve(count);
    }),
    findOne: jest.fn().mockImplementation((query) => {
      const doc = docs.find(d => {
        for (const [key, value] of Object.entries(query)) {
          if (d[key] !== value) return false;
        }
        return true;
      });
      return Promise.resolve(doc || null);
    }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };
}

function setupMockCollections() {
  mockCollection.mockImplementation((name) => {
    switch (name) {
      case 'otp': return createMockCollection(mockUsers);
      case 'boards': return createMockCollection(mockBoards);
      case 'accessLog': return createMockCollection(mockAccessLogs);
      case 'attachments': return createMockCollection(mockAttachments);
      case 'boardInvites': return createMockCollection(mockInvites);
      case 'activityLog': return createMockCollection(mockActivityLog);
      default: return createMockCollection([]);
    }
  });
}

describe('Admin Dashboard Endpoints', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
    setupMockCollections();
  });

  describe('GET /admin/dashboard/users-stats', () => {
    it('should return 200 with users stats', async () => {
      const response = await request(app)
        .get('/admin/dashboard/users-stats')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('active');
      expect(response.body).toHaveProperty('inactive');
      expect(response.body).toHaveProperty('admins');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/users-stats');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/boards-stats', () => {
    it('should return 200 with boards stats', async () => {
      const response = await request(app)
        .get('/admin/dashboard/boards-stats')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('public');
      expect(response.body).toHaveProperty('private');
      expect(response.body).toHaveProperty('totalCards');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/boards-stats');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/growth', () => {
    it('should return 200 with growth data', async () => {
      const response = await request(app)
        .get('/admin/dashboard/growth')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('usersByMonth');
      expect(response.body).toHaveProperty('boardsByMonth');
      expect(Array.isArray(response.body.usersByMonth)).toBe(true);
      expect(Array.isArray(response.body.boardsByMonth)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/growth');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/top-boards', () => {
    it('should return 200 with top boards', async () => {
      const response = await request(app)
        .get('/admin/dashboard/top-boards')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('totalCards');
      }
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/top-boards');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/activity-heatmap', () => {
    it('should return 200 with heatmap data', async () => {
      const response = await request(app)
        .get('/admin/dashboard/activity-heatmap')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('heatmap');
      expect(Array.isArray(response.body.heatmap)).toBe(true);
      expect(response.body.heatmap.length).toBe(7); // 7 days
      expect(response.body.heatmap[0].length).toBe(24); // 24 hours
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/activity-heatmap');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/engagement', () => {
    it('should return 200 with engagement data', async () => {
      const response = await request(app)
        .get('/admin/dashboard/engagement')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('active');
      expect(response.body).toHaveProperty('inactive');
      expect(response.body).toHaveProperty('total');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/engagement');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/column-distribution', () => {
    it('should return 200 with column distribution', async () => {
      const response = await request(app)
        .get('/admin/dashboard/column-distribution')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/column-distribution');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/attachments-growth', () => {
    it('should return 200 with attachments growth', async () => {
      const response = await request(app)
        .get('/admin/dashboard/attachments-growth')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('attachmentsByMonth');
      expect(response.body).toHaveProperty('storageByMonth');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/attachments-growth');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/visibility-trend', () => {
    it('should return 200 with visibility trend', async () => {
      const response = await request(app)
        .get('/admin/dashboard/visibility-trend')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('publicByMonth');
      expect(response.body).toHaveProperty('privateByMonth');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/visibility-trend');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/login-methods', () => {
    it('should return 200 with login methods distribution', async () => {
      const response = await request(app)
        .get('/admin/dashboard/login-methods')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('google');
      expect(response.body).toHaveProperty('total');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/login-methods');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/invite-funnel', () => {
    it('should return 200 with invite funnel data', async () => {
      const response = await request(app)
        .get('/admin/dashboard/invite-funnel')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('used');
      expect(response.body).toHaveProperty('expired');
      expect(response.body).toHaveProperty('pending');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/invite-funnel');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/dashboard/most-engaged-boards', () => {
    it('should return 200 with most engaged boards', async () => {
      const response = await request(app)
        .get('/admin/dashboard/most-engaged-boards')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('engagementScore');
      }
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/dashboard/most-engaged-boards');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /admin/users/:id/admin', () => {
    it('should toggle admin status to true', async () => {
      const response = await request(app)
        .patch('/admin/users/user2/admin')
        .set('Authorization', 'Bearer fake-token')
        .send({ isAdmin: true });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('isAdmin', true);
    });

    it('should toggle admin status to false', async () => {
      const response = await request(app)
        .patch('/admin/users/user1/admin')
        .set('Authorization', 'Bearer fake-token')
        .send({ isAdmin: false });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('isAdmin', false);
    });

    it('should return 400 when isAdmin is not boolean', async () => {
      const response = await request(app)
        .patch('/admin/users/user2/admin')
        .set('Authorization', 'Bearer fake-token')
        .send({ isAdmin: 'true' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('msg', 'isAdmin must be a boolean');
    });

    it('should return 404 when user not found', async () => {
      const response = await request(app)
        .patch('/admin/users/nonexistent/admin')
        .set('Authorization', 'Bearer fake-token')
        .send({ isAdmin: true });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('msg', 'User not found');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .patch('/admin/users/user2/admin')
        .send({ isAdmin: true });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/users', () => {
    it('should return 200 with all users', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/users');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/boards', () => {
    it('should return 200 with all boards', async () => {
      const response = await request(app)
        .get('/admin/boards')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/boards');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /admin/users/:id/toggle', () => {
    it('should toggle user active status', async () => {
      const response = await request(app)
        .patch('/admin/users/user2/toggle')
        .set('Authorization', 'Bearer fake-token')
        .send({ active: false });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 400 when active is not boolean', async () => {
      const response = await request(app)
        .patch('/admin/users/user2/toggle')
        .set('Authorization', 'Bearer fake-token')
        .send({ active: 'false' });

      expect(response.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .patch('/admin/users/user2/toggle')
        .send({ active: false });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /admin/activity-log', () => {
    it('should return 200 with paginated activity logs', async () => {
      const response = await request(app)
        .get('/admin/activity-log')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.logs[0]).toHaveProperty('id');
      expect(response.body.logs[0]).toHaveProperty('userName');
      expect(response.body.logs[0]).toHaveProperty('action');
    });

    it('should filter by search', async () => {
      const response = await request(app)
        .get('/admin/activity-log')
        .query({ search: 'João' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it('should filter by boardId', async () => {
      const response = await request(app)
        .get('/admin/activity-log')
        .query({ boardId: 'board1' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it('should filter by action', async () => {
      const response = await request(app)
        .get('/admin/activity-log')
        .query({ action: 'create_card' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/activity-log');
      expect(response.status).toBe(401);
    });

    it('should return 500 when an error occurs', async () => {
      mockCollection.mockImplementation(() => { throw new Error('DB error'); });
      const response = await request(app)
        .get('/admin/activity-log')
        .set('Authorization', 'Bearer fake-token');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /admin/invites', () => {
    it('should return 200 with all invites enriched', async () => {
      const response = await request(app)
        .get('/admin/invites')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('boardName');
      expect(response.body[0]).toHaveProperty('invitedByName');
      expect(response.body[0]).toHaveProperty('status');
    });

    it('should filter by status pending', async () => {
      const response = await request(app)
        .get('/admin/invites')
        .query({ status: 'pending' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status used', async () => {
      const response = await request(app)
        .get('/admin/invites')
        .query({ status: 'used' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status expired', async () => {
      const response = await request(app)
        .get('/admin/invites')
        .query({ status: 'expired' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search by email', async () => {
      const response = await request(app)
        .get('/admin/invites')
        .query({ search: 'test.com' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/invites');
      expect(response.status).toBe(401);
    });

    it('should return 500 when an error occurs', async () => {
      mockCollection.mockImplementation(() => { throw new Error('DB error'); });
      const response = await request(app)
        .get('/admin/invites')
        .set('Authorization', 'Bearer fake-token');
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /admin/invites/:id/invalidate', () => {
    it('should invalidate an invite', async () => {
      const response = await request(app)
        .patch('/admin/invites/inv2/invalidate')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 when invite not found', async () => {
      const response = await request(app)
        .patch('/admin/invites/nonexistent/invalidate')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('msg', 'Invite not found');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).patch('/admin/invites/inv2/invalidate');
      expect(response.status).toBe(401);
    });

    it('should return 500 when an error occurs', async () => {
      mockCollection.mockImplementation(() => { throw new Error('DB error'); });
      const response = await request(app)
        .patch('/admin/invites/inv2/invalidate')
        .set('Authorization', 'Bearer fake-token');
      expect(response.status).toBe(500);
    });
  });

  describe('POST /admin/invites/:id/resend', () => {
    beforeEach(() => {
      mockSendEmail.mockReset();
    });

    it('should resend invite email', async () => {
      const response = await request(app)
        .post('/admin/invites/inv2/resend')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(mockSendEmail).toHaveBeenCalled();
    });

    it('should return 404 when invite not found', async () => {
      const response = await request(app)
        .post('/admin/invites/nonexistent/resend')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('msg', 'Invite not found');
    });

    it('should return 400 when invite already used', async () => {
      const response = await request(app)
        .post('/admin/invites/inv1/resend')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('msg', 'Invite already used or invalid');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).post('/admin/invites/inv2/resend');
      expect(response.status).toBe(401);
    });

    it('should return 500 when an error occurs', async () => {
      mockCollection.mockImplementation(() => { throw new Error('DB error'); });
      const response = await request(app)
        .post('/admin/invites/inv2/resend')
        .set('Authorization', 'Bearer fake-token');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /admin/attachments', () => {
    it('should return 200 with all attachments enriched', async () => {
      const response = await request(app)
        .get('/admin/attachments')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('userName');
      expect(response.body[0]).toHaveProperty('boardName');
    });

    it('should filter by search', async () => {
      const response = await request(app)
        .get('/admin/attachments')
        .query({ search: 'file' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/attachments');
      expect(response.status).toBe(401);
    });

    it('should return 500 when an error occurs', async () => {
      mockCollection.mockImplementation(() => { throw new Error('DB error'); });
      const response = await request(app)
        .get('/admin/attachments')
        .set('Authorization', 'Bearer fake-token');
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /admin/attachments/:id', () => {
    beforeEach(() => {
      mockDeleteFileFromS3.mockReset();
    });

    it('should delete attachment', async () => {
      const response = await request(app)
        .delete('/admin/attachments/att1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(mockDeleteFileFromS3).toHaveBeenCalled();
    });

    it('should return 404 when attachment not found', async () => {
      const response = await request(app)
        .delete('/admin/attachments/nonexistent')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('msg', 'Attachment not found');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).delete('/admin/attachments/att1');
      expect(response.status).toBe(401);
    });

    it('should return 500 when an error occurs', async () => {
      mockCollection.mockImplementation(() => { throw new Error('DB error'); });
      const response = await request(app)
        .delete('/admin/attachments/att1')
        .set('Authorization', 'Bearer fake-token');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /admin/access-logs', () => {
    it('should return 200 with access logs', async () => {
      const response = await request(app)
        .get('/admin/access-logs')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.logs[0]).toHaveProperty('userName');
    });

    it('should filter by search', async () => {
      const response = await request(app)
        .get('/admin/access-logs')
        .query({ search: '127.0.0' })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/admin/access-logs')
        .query({ page: 1, limit: 10 })
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('page', 1);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/admin/access-logs');
      expect(response.status).toBe(401);
    });

    it('should return 500 when an error occurs', async () => {
      mockCollection.mockImplementation(() => { throw new Error('DB error'); });
      const response = await request(app)
        .get('/admin/access-logs')
        .set('Authorization', 'Bearer fake-token');
      expect(response.status).toBe(500);
    });
  });
});
