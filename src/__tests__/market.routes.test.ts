import request from 'supertest';
import app from '../index';

let token: string;

beforeAll(async () => {
  // Registra un usuario y guarda el token real
  const res = await request(app)
    .post('/trading/auth/signup')
    .send({
      name: 'Test User',
      email: 'market@test.com',
      password: 'Test123'
    });
  token = 'Bearer ' + res.body.data.token;
});

describe('Market Routes', () => {
  it('debería devolver 401 si no hay token', async () => {
    const response = await request(app)
      .get('/api/market/instruments');
    expect([401, 403]).toContain(response.status);
  });

  it('debería devolver 200 y un array de coins con estructura correcta', async () => {
    const response = await request(app)
      .get('/api/market/instruments')
      .set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('coins');
    expect(Array.isArray(response.body.coins)).toBe(true);
    if (response.body.coins.length > 0) {
      const coin = response.body.coins[0];
      expect(coin).toHaveProperty('id');
      expect(coin).toHaveProperty('name');
      expect(coin).toHaveProperty('symbol');
      expect(coin).toHaveProperty('price');
      expect(coin).toHaveProperty('high24h');
      expect(coin).toHaveProperty('low24h');
      expect(coin).toHaveProperty('volume24h');
      expect(coin).toHaveProperty('change24h');
      expect(coin).toHaveProperty('change7d');
    }
  });
}); 