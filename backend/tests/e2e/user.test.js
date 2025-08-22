const mockCallFunction = jest.fn();

jest.unstable_mockModule('./utils/parse-utils.js', () => ({
  callFunction: mockCallFunction
}));

jest.unstable_mockModule('./service/email-service.js', () => ({
  default: jest.fn().mockResolvedValue(true)
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

describe('User Endpoint', () => {

  beforeEach(() => {
    mockCallFunction.mockReset();
  });

  it('should return 201 Created with "OK" message when authenticated and valid data provided', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      phone: '1234567890',
      active: true
    };

    mockCallFunction.mockResolvedValue({ status: 'success' });

    const response = await request(app)
      .put('/user')
      .set('Authorization', 'Bearer fake-token')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.text).toBe('OK');

  });

  it('should return 401 when not authenticated', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    };

    const response = await request(app)
      .put('/user')
      .send(userData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('msg', 'Token not pass');

    expect(mockCallFunction).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    };

    mockCallFunction.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .put('/user')
      .set('Authorization', 'Bearer fake-token')
      .send(userData);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Occurred error in update otp');
  });


    it('should return 201 Inactive User', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      phone: '1234567890',
      active: false
    };
    mockCallFunction.mockResolvedValue({ status: 'success' });

    const response = await request(app)
      .put('/user')
      .set('Authorization', 'Bearer fake-token')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.text).toBe('OK');

  });

  describe('GET /user/me', () => {
    it('should return 200 with user data when authenticated', async () => {
      const mockUserData = {
        id: 'mock-user-id',
        name: 'Mock User',
        email: 'mock@example.com',
        phone: '1234567890',
        avatar: 'https://example.com/avatar.jpg',
        active: true
      };

      mockCallFunction.mockResolvedValue(mockUserData);

      const response = await request(app)
        .get('/user/me')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserData);
      expect(mockCallFunction).toHaveBeenCalledWith(
        'getUserMe',
        { id: 'mock-user-id' },
        'fake-token'
      );
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/user/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('msg', 'Token not pass');
      expect(mockCallFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .get('/user/me')
        .set('Authorization', 'Invalid token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('msg', 'Token not pass');
      expect(mockCallFunction).not.toHaveBeenCalled();
    });

    it('should return 500 when an error occurs in cloud function', async () => {
      mockCallFunction.mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .get('/user/me')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Occurred error in get user data');
      expect(mockCallFunction).toHaveBeenCalledWith(
        'getUserMe',
        { id: 'mock-user-id' },
        'fake-token'
      );
    });
  });


});
