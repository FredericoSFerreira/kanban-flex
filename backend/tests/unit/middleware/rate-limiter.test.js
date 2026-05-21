// Mock das dependências
await jest.unstable_mockModule('./service/redis-service.js', () => ({
  getRedisClient: jest.fn()
}));

// Importar as funções depois de mockar as dependências
const { rateLimiter } = await import('../../../middleware/rate-limiter.js');
const { getRedisClient } = await import('../../../service/redis-service.js');

describe('Rate Limiter Middleware', () => {
  let req, res, next, mockRedisClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRedisClient = {
      incr: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn()
    };

    getRedisClient.mockResolvedValue(mockRedisClient);

    req = {
      ip: '127.0.0.1',
      originalUrl: '/test-route'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };

    next = jest.fn();
  });

  it('should call next() when there is no previous count in Redis', async () => {
    // Arrange
    mockRedisClient.incr.mockResolvedValue(1);
    mockRedisClient.ttl.mockResolvedValue(60);
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(getRedisClient).toHaveBeenCalled();
    expect(mockRedisClient.incr).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1');
    expect(mockRedisClient.expire).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1', 60);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '10');
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '9');
    expect(next).toHaveBeenCalled();
  });

  it('should not set expire when there is already a previous count in Redis', async () => {
    // Arrange
    mockRedisClient.incr.mockResolvedValue(5);
    mockRedisClient.ttl.mockResolvedValue(45);
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.incr).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1');
    expect(mockRedisClient.expire).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '10');
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '5');
    expect(next).toHaveBeenCalled();
  });

  it('should return 429 when the request limit is exceeded', async () => {
    // Arrange
    mockRedisClient.incr.mockResolvedValue(11); // above default maxRequests (10)
    mockRedisClient.ttl.mockResolvedValue(30);
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.incr).toHaveBeenCalledWith('ratelimit:/test-route:127.0.0.1');
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '30');
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many requests, please try again later.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should use user id as identifier when available', async () => {
    // Arrange
    req.user = { id: 'user-123' };
    mockRedisClient.incr.mockResolvedValue(1);
    mockRedisClient.ttl.mockResolvedValue(60);
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.incr).toHaveBeenCalledWith('ratelimit:/test-route:user-123');
    expect(mockRedisClient.expire).toHaveBeenCalledWith('ratelimit:/test-route:user-123', 60);
  });

  it('should use user email as identifier when id is not available', async () => {
    // Arrange
    req.user = { email: 'user@example.com' };
    mockRedisClient.incr.mockResolvedValue(1);
    mockRedisClient.ttl.mockResolvedValue(60);
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.incr).toHaveBeenCalledWith('ratelimit:/test-route:user@example.com');
    expect(mockRedisClient.expire).toHaveBeenCalledWith('ratelimit:/test-route:user@example.com', 60);
  });

  it('should accept params customize', async () => {
    // Arrange
    mockRedisClient.incr.mockResolvedValue(1);
    mockRedisClient.ttl.mockResolvedValue(30);
    const maxRequests = 5;
    const windowMs = 30000; // 30 segundos
    const keyPrefix = 'custom';
    const middleware = rateLimiter(maxRequests, windowMs, keyPrefix);

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.incr).toHaveBeenCalledWith('custom:/test-route:127.0.0.1');
    expect(mockRedisClient.expire).toHaveBeenCalledWith('custom:/test-route:127.0.0.1', 30);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');
  });

  it('should call next() and log error when Redis fails', async () => {
    // Arrange
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

  it('should fallback to req.ip when user is not present', async () => {
    // Arrange
    req.ip = '192.168.1.1';
    mockRedisClient.incr.mockResolvedValue(1);
    mockRedisClient.ttl.mockResolvedValue(60);
    const middleware = rateLimiter();

    // Act
    await middleware(req, res, next);

    // Assert
    expect(mockRedisClient.incr).toHaveBeenCalledWith('ratelimit:/test-route:192.168.1.1');
    expect(mockRedisClient.expire).toHaveBeenCalledWith('ratelimit:/test-route:192.168.1.1', 60);
    expect(next).toHaveBeenCalled();
  });
});
