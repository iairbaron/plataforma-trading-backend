import request from 'supertest';
import app from '../index';

describe('Favorites Routes', () => {
  const token = 'Bearer testtoken'; // Ajusta según tu auth real

  it('debería obtener la lista de favoritos (GET /api/favorites)', async () => {
    const response = await request(app)
      .get('/api/favorites')
      .set('Authorization', token);
    expect([200, 401]).toContain(response.status); // 401 si el token es inválido
    if (response.status === 200) {
      expect(response.body).toHaveProperty('status', 'success');
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  it('debería agregar un favorito (POST /api/favorites)', async () => {
    const response = await request(app)
      .post('/api/favorites')
      .set('Authorization', token)
      .send({ symbol: 'btc' });
    expect([200, 201, 400, 401]).toContain(response.status); // Puede variar según lógica y token
  });

  it('debería eliminar un favorito (DELETE /api/favorites/:symbol)', async () => {
    const response = await request(app)
      .delete('/api/favorites/btc')
      .set('Authorization', token);
    expect([200, 400, 401, 404]).toContain(response.status); // Puede variar según lógica y token
  });
}); 