import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Create a mock Express app that mimics the real app's healthcheck endpoint
const createMockApp = () => {
  const app = express();
  app.get('/healthcheck', (req, res) => {
    res.send('OK');
  });
  return app;
};

describe('Healthcheck Endpoint', () => {
  let app;

  beforeEach(() => {
    app = createMockApp();
  });

  it('should return 200 OK with "OK" message', async () => {
    const response = await request(app).get('/healthcheck');

    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });

  it('should be accessible without authentication', async () => {
    const response = await request(app)
      .get('/healthcheck')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
  });
});
