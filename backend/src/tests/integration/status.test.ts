import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'guess-io-backend');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return a valid ISO timestamp', async () => {
    const response = await request(app).get('/api/health');

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});
