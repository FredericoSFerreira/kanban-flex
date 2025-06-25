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


const mockAccessLogs = [
  {
    id: '1',
    userId: 'user123',
    timestamp: new Date().toISOString(),
    action: 'login',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0'
  },
  {
    id: '2',
    userId: 'user123',
    timestamp: new Date().toISOString(),
    action: 'view_dashboard',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0'
  }
];


describe('Access Logs Endpoint', () => {
  //
  beforeEach(() => {
    mockCallFunction.mockReset();
  });


  it('should return 200 OK with access logs data when authenticated', async () => {
    mockCallFunction.mockResolvedValue(mockAccessLogs);
    const response = await request(app)
      .get('/access-logs')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id', '1');
    expect(response.body[0]).toHaveProperty('userId', 'user123');
    expect(response.body[0]).toHaveProperty('action', 'login');
    expect(response.body[1]).toHaveProperty('id', '2');
    expect(response.body[1]).toHaveProperty('action', 'view_dashboard');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getMyAccessLogs',
      {id: 'mock-user-id', name: 'Mock User'},
      'fake-token'
    );
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/access-logs');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('msg', 'Token not pass');

    expect(mockCallFunction).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    mockCallFunction.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/access-logs')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in get access log');

    expect(mockCallFunction).toHaveBeenCalledWith(
      'getMyAccessLogs',
      {id: 'mock-user-id', name: 'Mock User'},
      'fake-token'
    );
  });

});
