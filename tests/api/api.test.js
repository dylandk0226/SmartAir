const request = require('supertest');

const API_URL = process.env.API_URL || 'https://smartair-1vb7.onrender.com';

describe('API Layer Tests - Bookings', () => {
  test('GET /api/bookings without a token returns 403 and an error message', async () => {
    // Act - send the request with no Authorization header
    const response = await request(API_URL).get('/api/bookings');

    // Assert - HTTP status code
    expect(response.status).toBe(403);

    // Assert - response body structure
    expect(response.body).toHaveProperty('error');
  });
});