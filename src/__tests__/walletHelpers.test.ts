import { validateAmount, getWalletOrError, hasFunds, hasAssets } from '../utils/walletHelpers';
import prisma from '../prisma';

// Mock de Response para capturar status y json
function createMockRes() {
  return {
    statusCode: 0,
    jsonData: null,
    status(code: number) { this.statusCode = code; return this; },
    json(data: any) { this.jsonData = data; return this; }
  };
}

describe('walletHelpers', () => {
  describe('validarAmount', () => {
    it('devuelve true para amount > 0', () => {
      const res = createMockRes();
      expect(validateAmount(10, res as any)).toBe(true);
      expect(res.statusCode).toBe(0);
    });
    it('devuelve false y responde 400 para amount <= 0', () => {
      const res = createMockRes();
      expect(validateAmount(0, res as any)).toBe(false);
      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toHaveProperty('code', 'INVALID_AMOUNT');
    });
  });

  describe('getWalletOrError', () => {
    let userId: string;
    beforeAll(async () => {
      // Crea un usuario y wallet de prueba
      const user = await prisma.user.create({
        data: { name: 'Helper User', email: 'helper@test.com', password: 'Test123' }
      });
      await prisma.wallet.create({ data: { userId: user.id, balance: 100 } });
      userId = user.id;
    });
    afterAll(async () => {
      await prisma.wallet.deleteMany();
      await prisma.user.deleteMany();
    });
    it('devuelve la wallet si existe', async () => {
      const res = createMockRes();
      const wallet = await getWalletOrError(userId, res as any);
      expect(wallet).not.toBeNull();
      expect(wallet?.userId).toBe(userId);
    });
    it('responde 404 si no existe la wallet', async () => {
      const res = createMockRes();
      const wallet = await getWalletOrError('no-existe', res as any);
      expect(wallet).toBeNull();
      expect(res.statusCode).toBe(404);
      expect(res.jsonData).toHaveProperty('code', 'WALLET_NOT_FOUND');
    });
  });

  describe('hasFunds', () => {
    it('devuelve true si hay fondos', () => {
      const res = createMockRes();
      expect(hasFunds({ balance: 100 }, 50, res as any)).toBe(true);
      expect(res.statusCode).toBe(0);
    });
    it('devuelve false y responde 400 si no hay fondos', () => {
      const res = createMockRes();
      expect(hasFunds({ balance: 10 }, 50, res as any)).toBe(false);
      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toHaveProperty('code', 'INSUFFICIENT_FUNDS');
    });
  });

  describe('hasAssets', () => {
    let userId: string;
    beforeAll(async () => {
      // Crea usuario y órdenes de compra/venta
      const user = await prisma.user.create({
        data: { name: 'Activo User', email: 'activo@test.com', password: 'Test123' }
      });
      userId = user.id;
      await prisma.order.createMany({
        data: [
          { userId, symbol: 'btc', type: 'buy', amount: 2, priceAtExecution: 1000 },
          { userId, symbol: 'btc', type: 'sell', amount: 1, priceAtExecution: 1200 },
        ]
      });
    });
    afterAll(async () => {
      await prisma.order.deleteMany();
      await prisma.user.deleteMany();
    });
    it('devuelve true si tiene activos suficientes', async () => {
      const res = createMockRes();
      const ok = await hasAssets(userId, 'btc', 1, res as any);
      expect(ok).toBe(true);
    });
    it('devuelve false y responde 400 si no tiene activos suficientes', async () => {
      const res = createMockRes();
      const ok = await hasAssets(userId, 'btc', 5, res as any);
      expect(ok).toBe(false);
      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toHaveProperty('code', 'INSUFFICIENT_ASSETS');
    });
  });
}); 