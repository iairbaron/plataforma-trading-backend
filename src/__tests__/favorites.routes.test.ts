import request from 'supertest';
import app from '../index';

let token: string;

beforeAll(async () => {
  const res = await request(app)
    .post('/trading/auth/signup')
    .send({
      name: 'Test User',
      email: 'testfav@test.com',
      password: 'Test123'
    });
  token = 'Bearer ' + res.body.data.token;
});

describe('Favorites Routes', () => {
  it('debería obtener la lista de favoritos (GET /api/favorites)', async () => {
    const response = await request(app)
      .get('/api/favorites')
      .set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('debería agregar un favorito (POST /api/favorites)', async () => {
    const response = await request(app)
      .post('/api/favorites')
      .set('Authorization', token)
      .send({ symbol: 'btc' });
    expect([200, 201]).toContain(response.status);
  });

  it('debería eliminar un favorito (DELETE /api/favorites/:symbol)', async () => {
    const response = await request(app)
      .delete('/api/favorites/btc')
      .set('Authorization', token);
    expect([200, 204]).toContain(response.status);
  });
}); 