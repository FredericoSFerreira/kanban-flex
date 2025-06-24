import request from 'supertest';
import app from '../../app.js';

describe('Healthcheck Endpoint', () => {


  it('should return 200 OK with "OK" message', async () => {
    const response = await request(app).get('/healthcheck');

    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});
