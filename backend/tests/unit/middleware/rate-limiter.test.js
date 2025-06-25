// Mock das dependências
await jest.unstable_mockModule('./service/redis-service.js', () => ({
  getRedisClient: jest.fn()
}));

await jest.unstable_mockModule('./utils/utils.js', () => ({
  parseBoolean: jest.fn()
}));

// Importar as funções depois de mockar as dependências
const { rateLimiter } = await import('../../../middleware/rate-limiter.js');
const { getRedisClient } = await import('../../../service/redis-service.js');
const { parseBoolean } = await import('../../../utils/utils.js');

describe('Rate Limiter Middleware', () => {
  let req, res, next, mockRedisClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRedisClient = {
      get: jest.fn(),
      incr: jest.fn(),
      setEx: jest.fn()
    };

    getRedisClient.mockResolvedValue(mockRedisClient);

    req = {
      query: {},
      ip: '127.0.0.1',
      originalUrl: '/test-route'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  it('should ignore rate limit when retry=false', async () => {
    // Arrange
    parseBoolean.mockReturnValue(false);
    req.query.retry = 'false';
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(getRedisClient).not.toHaveBeenCalled();
    expect(parseBoolean).toHaveBeenCalledWith('false');
  });

  it('should call next() when there is no previous count in Redis', async () => {
    // Arrange
    parseBoolean.mockReturnValue(true);
    req.query.retry = 'true';
    mockRedisClient.get.mockResolvedValue(null);
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(getRedisClient).toHaveBeenCalled();
    expect(mockRedisClient.get).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1');
    expect(mockRedisClient.setEx).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1', 60, '1');
    expect(next).toHaveBeenCalled();
  });

  it('should increment the count when there is already a previous count in Redis', async () => {
    // Arrange
    parseBoolean.mockReturnValue(true);
    req.query.retry = 'true';
    mockRedisClient.get.mockResolvedValue('5');
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.get).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1');
    expect(mockRedisClient.incr).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1');
    expect(mockRedisClient.setEx).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should return 429 when the request limit is exceeded', async () => {
    // Arrange
    parseBoolean.mockReturnValue(true);
    req.query.retry = 'true';
    mockRedisClient.get.mockResolvedValue('10'); // igual ao padrão maxRequests
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.get).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1');
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many requests, please try again later.',
      retryAfter: 60
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should use user id as identifier when available', async () => {
    // Arrange
    parseBoolean.mockReturnValue(true);
    req.query.retry = 'true';
    req.user = { id: 'user-123' };
    mockRedisClient.get.mockResolvedValue(null);
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.get).toHaveBeenCalledWith('ratelimit:/test-route:user-123');
    expect(mockRedisClient.setEx).toHaveBeenCalledWith('ratelimit:/test-route:user-123', 60, '1');
  });

  it('should accept params customize', async () => {
    // Arrange
    parseBoolean.mockReturnValue(true);
    req.query.retry = 'true';
    mockRedisClient.get.mockResolvedValue(null);
    const maxRequests = 5;
    const windowMs = 30000; // 30 segundos
    const keyPrefix = 'custom';
    const middleware = rateLimiter(maxRequests, windowMs, keyPrefix);

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.get).toHaveBeenCalledWith('custom:/test-route:127.0.0.1');
    expect(mockRedisClient.setEx).toHaveBeenCalledWith('custom:/test-route:127.0.0.1', 30, '1');
  });

  it('should call next() and logger error while Redis fail', async () => {
    // Arrange
    parseBoolean.mockReturnValue(true);
    req.query.retry = 'true';
    const error = new Error('Redis connection error');
    getRedisClient.mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith('Rate limiter error:', error);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
