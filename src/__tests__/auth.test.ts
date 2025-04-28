import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    // Limpia las tablas en orden correcto para evitar errores de clave foránea
    await prisma.favorite.deleteMany();
    await prisma.order.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /trading/auth/signup', () => {
    it('debería registrar un usuario correctamente', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123'
      };
      const response = await request(app)
        .post('/trading/auth/signup')
        .send(userData);
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('no debe permitir emails duplicados', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123'
      };
      await request(app).post('/trading/auth/signup').send(userData);
      const response = await request(app).post('/trading/auth/signup').send(userData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'USER_EXISTS');
    });

    it('debe validar campos requeridos', async () => {
      const response = await request(app)
        .post('/trading/auth/signup')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /trading/auth/login', () => {
    beforeEach(async () => {
      // Crea un usuario para login
      await request(app).post('/trading/auth/signup').send({
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123'
      });
    });

    it('debería loguear correctamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/trading/auth/login')
        .send({ email: 'test@test.com', password: 'Test123' });
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@test.com');
      expect(response.body.message).toBe('Login successful');
    });

    it('debe fallar con password incorrecto', async () => {
      const response = await request(app)
        .post('/trading/auth/login')
        .send({ email: 'test@test.com', password: 'WrongPassword' });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('debe fallar con email inexistente', async () => {
      const response = await request(app)
        .post('/trading/auth/login')
        .send({ email: 'noexiste@test.com', password: 'Test123' });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('debe validar campos requeridos', async () => {
      const response = await request(app)
        .post('/trading/auth/login')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
