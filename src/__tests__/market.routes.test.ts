import request from 'supertest';
import app from '../index';

describe('Market Routes', () => {
  describe('GET /api/market/instruments', () => {
    it('debería devolver 200 y un array de coins', async () => {
      // Aquí podrías mockear el authMiddleware o usar un token válido si es necesario
      const response = await request(app)
        .get('/api/market/instruments')
        .set('Authorization', 'Bearer testtoken'); // Ajusta el token según tu auth
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('coins');
      expect(Array.isArray(response.body.coins)).toBe(true);
    });
  });
}); 