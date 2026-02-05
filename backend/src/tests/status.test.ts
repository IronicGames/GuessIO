import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { API_ROUTES, getApiRoute } from '../constants/constants';

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const response = await request(app).get(getApiRoute(API_ROUTES.HEALTH));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 200);
    expect(response.body).toHaveProperty('service', 'guess-io-backend');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return a valid ISO timestamp', async () => {
    const response = await request(app).get(getApiRoute(API_ROUTES.HEALTH));

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});
