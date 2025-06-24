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
  }
}));


const request = (await import('supertest')).default;
const {default: app} = await import('../../app.js');

const mockBoards = [
  {
    id: 'board1',
    name: 'Sprint Retrospective 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id'
  },
  {
    id: 'board2',
    name: 'Sprint Retrospective 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: 'mock-user-id'
  }
];



describe('My Boards Endpoint', () => {
  beforeEach(() => {
    mockCallFunction.mockReset();
  });
  it('should return 200 OK with boards data when authenticated', async () => {
    mockCallFunction.mockResolvedValue(mockBoards);

    const response = await request(app)
      .get('/my-boards')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id', 'board1');
    expect(response.body[0]).toHaveProperty('name', 'Sprint Retrospective 1');
    expect(response.body[0]).toHaveProperty('owner', 'mock-user-id');
    expect(response.body[1]).toHaveProperty('id', 'board2');
    expect(response.body[1]).toHaveProperty('name', 'Sprint Retrospective 2');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getMyBoards',
      {id: 'mock-user-id', name: 'Mock User'},
      'fake-token'
    );
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/my-boards');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('msg', 'Token not pass');

    expect(mockCallFunction).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    mockCallFunction.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/my-boards')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in get my board');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getMyBoards',
      {id: 'mock-user-id', name: 'Mock User'},
      'fake-token'
    );
  });
});
