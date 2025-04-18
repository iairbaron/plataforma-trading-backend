import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123' // Valid password with uppercase and number
      };

      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      // Try to signup with same email
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveLength(3); // name, email, password
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Test123'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Must be a valid email'
          })
        ])
      );
    });

    it('should validate password requirements', async () => {
      const testCases = [
        {
          password: '123', // too short
          expectedError: 'Password must be at least 5 characters long'
        },
        {
          password: '12345', // no uppercase
          expectedError: 'Password must contain at least one uppercase letter'
        },
        {
          password: 'Abcde', // no number
          expectedError: 'Password must contain at least one number'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({
            name: 'Test User',
            email: 'test@test.com',
            password: testCase.password
          });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: testCase.expectedError
            })
          ])
        );
      }
    });
  });

  describe('POST /api/auth/login', () => {
    // Helper function to create a test user
    const createTestUser = async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test123', salt);
      
      return prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@test.com',
          password: hashedPassword
        }
      });
    };

    it('should login successfully with correct credentials', async () => {
      // Create test user first
      await createTestUser();

      const loginData = {
        email: 'test@test.com',
        password: 'Test123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.message).toBe('Login successful');
    });

    it('should fail with incorrect password', async () => {
      // Create test user first
      await createTestUser();

      const loginData = {
        email: 'test@test.com',
        password: 'WrongPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'Test123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
}); 