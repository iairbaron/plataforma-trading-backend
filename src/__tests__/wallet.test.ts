import request from 'supertest';
import app from '../index';

let token: string;

beforeAll(async () => {
  // Registra un usuario y obtiene el token
  const res = await request(app)
    .post('/trading/auth/signup')
    .send({
      name: 'Wallet User',
      email: 'wallet@test.com',
      password: 'Test123'
    });
  token = 'Bearer ' + res.body.data.token;
});

describe('Wallet Routes', () => {
  it('debería obtener el balance inicial (GET /api/wallet/balance)', async () => {
    const response = await request(app)
      .get('/api/wallet/balance')
      .set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('usdBalance');
    expect(response.body.data).toHaveProperty('totalCoinValue');
    expect(response.body.data).toHaveProperty('coinDetails');
  });

  it('debería depositar fondos correctamente', async () => {
    const response = await request(app)
      .post('/api/wallet/balance')
      .set('Authorization', token)
      .send({ operation: 'deposit', amount: 500 });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('balance');
  });

  it('debería retirar fondos correctamente', async () => {
    // Deposita primero para asegurar fondos
    await request(app)
      .post('/api/wallet/balance')
      .set('Authorization', token)
      .send({ operation: 'deposit', amount: 500 });
    const response = await request(app)
      .post('/api/wallet/balance')
      .set('Authorization', token)
      .send({ operation: 'withdraw', amount: 200 });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('balance');
  });

  it('debe fallar al retirar más fondos de los disponibles', async () => {
    const response = await request(app)
      .post('/api/wallet/balance')
      .set('Authorization', token)
      .send({ operation: 'withdraw', amount: 100000 });
    expect([400, 500]).toContain(response.status);
    expect(response.body).toHaveProperty('code');
  });

  it('debe validar operación inválida', async () => {
    const response = await request(app)
      .post('/api/wallet/balance')
      .set('Authorization', token)
      .send({ operation: 'invalid', amount: 100 });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'INVALID_OPERATION');
  });

  it('debe validar amount inválido', async () => {
    const response = await request(app)
      .post('/api/wallet/balance')
      .set('Authorization', token)
      .send({ operation: 'deposit', amount: -10 });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'INVALID_AMOUNT');
  });
}); 