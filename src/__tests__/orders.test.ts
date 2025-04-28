import request from 'supertest';
import app from '../index';
import Coin from '../sdk/coin';

let token: string;
let symbol = 'btc';
let coinPrice = 1000;

beforeAll(async () => {
  // Mockea las coins para que siempre haya una BTC
  (Coin as any).coins = [{
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    price: coinPrice,
    high24h: 1100,
    low24h: 900,
    volume24h: 1000000,
    change24h: 2.5,
    change7d: 5.0
  }];
  // Registra un usuario y obtiene el token
  const res = await request(app)
    .post('/trading/auth/signup')
    .send({
      name: 'Order User',
      email: 'order@test.com',
      password: 'Test123'
    });
  token = 'Bearer ' + res.body.data.token;
});

describe('Orders Routes', () => {
  it('debería crear una orden de compra correctamente', async () => {
    // Deposita fondos primero
    await request(app)
      .post('/api/wallet/balance')
      .set('Authorization', token)
      .send({ operation: 'deposit', amount: 2000 });
    // Crea la orden
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({ symbol, amount: 1, type: 'buy' });
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.symbol).toBe(symbol);
    expect(response.body.data.type).toBe('buy');
  });

  it('debería crear una orden de venta correctamente', async () => {
    // Vende una parte de lo comprado
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({ symbol, amount: 0.5, type: 'sell' });
    expect([201, 200]).toContain(response.status);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.symbol).toBe(symbol);
    expect(response.body.data.type).toBe('sell');
  });

  it('debe fallar si no hay fondos suficientes para comprar', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({ symbol, amount: 100, type: 'buy' }); // Monto muy alto
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'INSUFFICIENT_FUNDS');
  });

  it('debe fallar si no tiene activos suficientes para vender', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({ symbol, amount: 100, type: 'sell' }); // Monto muy alto
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'INSUFFICIENT_ASSETS');
  });

  it('debería obtener la lista de órdenes del usuario', async () => {
    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    if (response.body.data.length > 0) {
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('symbol');
      expect(response.body.data[0]).toHaveProperty('type');
    }
  });

  // Casos de validación markerOrder.middleware
  it('debe fallar si faltan campos obligatorios', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'ORDER_VALIDATION_MISSING_FIELDS');
  });

  it('debe fallar si el tipo de orden es inválido', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({ symbol, amount: 1, type: 'invalid' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'ORDER_VALIDATION_INVALID_TYPE');
  });

  it('debe fallar si la moneda no existe', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({ symbol: 'noexiste', amount: 1, type: 'buy' });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('code', 'ORDER_VALIDATION_COIN_NOT_FOUND');
  });

  it('debe fallar si el amount es inválido', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', token)
      .send({ symbol, amount: -1, type: 'buy' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'INVALID_AMOUNT');
  });
}); 