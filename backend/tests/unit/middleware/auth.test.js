await jest.unstable_mockModule('jose', () => ({
  jwtVerify: jest.fn()
}));

global.Parse = {
  Error: class ParseError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  }
};

process.env.JWT_SECRET_KEY = 'test-secret-key';

const {verifyToken, verifyTokenParseCloudFunction} = await import('../../../middleware/auth.js');
const {jwtVerify} = await import('jose');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('verifyToken', () => {
    it('should return 401 when token is not provided', async () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      await verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({msg: 'Token not pass'});
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when authorization header does not start with "Bearer"', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat xyz123';

      // Act
      await verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({msg: 'Invalid Token'});
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() with user information when token is valid', async () => {
      // Arrange
      const token = 'valid-token';
      const mockPayload = {id: 'user-123', name: 'Test User'};
      req.headers.authorization = `Bearer ${token}`;

      jwtVerify.mockResolvedValue({payload: mockPayload});

      // Act
      await verifyToken(req, res, next);

      // Assert
      expect(jwtVerify).toHaveBeenCalledWith(token, expect.any(Uint8Array), {
        algorithms: ['HS256'],
      });
      expect(req.user).toEqual(mockPayload);
      expect(req.token).toEqual({context: {'Authorization': `Bearer ${token}`}});
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 when token is invalid', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid-token';
      jwtVerify.mockRejectedValue(new Error('Token validation failed'));

      // Act
      await verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({msg: 'Invalid Token'});
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verifyTokenParseCloudFunction', () => {
    let request;

    beforeEach(() => {
      request = {
        functionName: '',
        context: {}
      };
    });

    it('should return true for public functions without verify token', async () => {
      // Arrange
      const publicFunctions = ['saveOtp', 'getOtp', 'checkOtp'];

      for (const funcName of publicFunctions) {
        request.functionName = funcName;

        // Act
        const result = await verifyTokenParseCloudFunction(request);

        // Assert
        expect(result).toBe(true);
        expect(jwtVerify).not.toHaveBeenCalled();
      }
    });

    it('should trow Parse.Error 401 when token is not provided', async () => {
      // Arrange
      request.functionName = 'privateFunction';
      request.context = {Authorization: ''};

      // Act & Assert
      await expect(verifyTokenParseCloudFunction(request))
        .rejects
        .toThrow('JWT token is required');

      expect(jwtVerify).not.toHaveBeenCalled();
    });

    it('should trow Parse.Error 401 when token is invalid', async () => {
      // Arrange
      request.functionName = 'privateFunction';
      request.context = {Authorization: 'Bearer invalid-token'};
      jwtVerify.mockRejectedValue(new Error('Token validation failed'));

      // Act & Assert
      await expect(verifyTokenParseCloudFunction(request))
        .rejects
        .toThrow('Invalid JWT token');

      expect(jwtVerify).toHaveBeenCalledWith('invalid-token', expect.any(Uint8Array), {
        algorithms: ['HS256'],
      });
    });

    it('should define request.user and retorn true when token is valid', async () => {
      // Arrange
      const mockPayload = {id: 'user-123', name: 'Test User'};
      request.functionName = 'privateFunction';
      request.context = {Authorization: 'Bearer valid-token'};
      jwtVerify.mockResolvedValue({payload: mockPayload});

      // Act
      const result = await verifyTokenParseCloudFunction(request);

      // Assert
      expect(result).toBe(true);
      expect(request.user).toEqual(mockPayload);
      expect(jwtVerify).toHaveBeenCalledWith('valid-token', expect.any(Uint8Array), {
        algorithms: ['HS256'],
      });
    });

    it('should extract correctly token to do header Authorization', async () => {
      // Arrange
      const mockPayload = {id: 'user-123', name: 'Test User'};
      request.functionName = 'privateFunction';
      request.context = {Authorization: 'Bearer complex-token-with.dots.and-dashes'};
      jwtVerify.mockResolvedValue({payload: mockPayload});

      // Act
      await verifyTokenParseCloudFunction(request);

      // Assert
      expect(jwtVerify).toHaveBeenCalledWith('complex-token-with.dots.and-dashes', expect.any(Uint8Array), {
        algorithms: ['HS256'],
      });
    });
  });
});
