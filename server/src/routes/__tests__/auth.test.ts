import request from 'supertest';
import express from 'express';
import * as fc from 'fast-check';
import authRoutes from '../auth';
import * as authService from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property Tests', () => {
    /**
     * **Feature: employee-leave-system, Property 3: 成功登入會話建立**
     * 對於任何有效的登入憑證，系統應該建立使用者會話並重導向到適當的頁面
     * **Validates: Requirements 1.3**
     */
    test('Property 3: Successful login session establishment', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            employeeId: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
            password: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 20 }),
            name: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9\u4e00-\u9fff]/.test(c)), { minLength: 1, maxLength: 20 }),
            permission: fc.constantFrom('employee' as const, 'admin' as const)
          }),
          async (validUser) => {
            // Clear previous mocks and set up new mock for this iteration
            jest.clearAllMocks();
            
            // Mock successful authentication
            mockedAuthService.authenticateUser.mockResolvedValue({
              success: true,
              data: {
                token: 'mock-jwt-token-' + validUser.employeeId,
                user: {
                  employeeId: validUser.employeeId,
                  name: validUser.name,
                  permission: validUser.permission
                }
              },
              message: '登入成功'
            });

            const response = await request(app)
              .post('/api/auth/login')
              .send({
                employeeId: validUser.employeeId,
                password: validUser.password
              });

            // For any valid credentials, system should establish user session
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.token).toContain('mock-jwt-token');
            expect(response.body.data.user).toEqual({
              employeeId: validUser.employeeId,
              name: validUser.name,
              permission: validUser.permission
            });
            expect(response.body.message).toBe('登入成功');
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * **Feature: employee-leave-system, Property 4: 登入失敗處理**
     * 對於任何無效的登入憑證，系統應該顯示錯誤訊息並保持在登入頁面
     * **Validates: Requirements 1.4**
     */
    test('Property 4: Login failure handling', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            employeeId: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
            password: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 20 })
          }),
          fc.constantFrom(
            '工號或密碼錯誤',
            '帳號不存在',
            '密碼錯誤'
          ),
          async (invalidCredentials, errorMessage) => {
            // Clear previous mocks and set up new mock for this iteration
            jest.clearAllMocks();
            
            // Mock failed authentication
            mockedAuthService.authenticateUser.mockResolvedValue({
              success: false,
              message: errorMessage
            });

            const response = await request(app)
              .post('/api/auth/login')
              .send(invalidCredentials);

            // For any invalid credentials, system should show error and stay on login page
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(errorMessage);
            expect(response.body.data).toBeUndefined();
            expect(response.body.user).toBeUndefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('POST /api/auth/login', () => {
    test('should return 400 for missing employeeId', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('工號和密碼為必填欄位');
    });

    test('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ employeeId: 'EMP001' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toBe('工號和密碼為必填欄位');
    });

    test('should return 401 for invalid credentials', async () => {
      mockedAuthService.authenticateUser.mockResolvedValue({
        success: false,
        message: '工號或密碼錯誤'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          employeeId: 'EMP001',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('工號或密碼錯誤');
    });

    test('should return 200 and token for valid credentials', async () => {
      const mockUser = {
        employeeId: 'EMP001',
        name: '測試員工',
        permission: 'employee' as const
      };

      mockedAuthService.authenticateUser.mockResolvedValue({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: mockUser
        },
        message: '登入成功'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          employeeId: 'EMP001',
          password: 'correctpassword'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('mock-jwt-token');
      expect(response.body.data.user).toEqual(mockUser);
      expect(response.body.message).toBe('登入成功');
    });

    test('should handle service errors gracefully', async () => {
      mockedAuthService.authenticateUser.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          employeeId: 'EMP001',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INTERNAL_ERROR');
      expect(response.body.message).toBe('系統錯誤，請稍後再試');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should return success message', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登出成功');
    });
  });

  describe('GET /api/auth/verify', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_TOKEN');
      expect(response.body.message).toBe('未提供驗證token');
    });

    test('should return 401 for invalid token', async () => {
      // Mock verifyToken to return null for invalid token
      mockedAuthService.verifyToken.mockReturnValue(null);
      mockedAuthService.extractTokenFromHeader.mockReturnValue('invalid-token');

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('TOKEN_EXPIRED');
      expect(response.body.message).toBe('Token已過期或無效');
    });

    test('should return user info for valid token', async () => {
      const mockUser = {
        employeeId: 'EMP001',
        name: '測試員工',
        permission: 'employee' as const
      };

      // Mock the verifyToken function to return a valid user
      mockedAuthService.verifyToken.mockReturnValue(mockUser);
      mockedAuthService.extractTokenFromHeader.mockReturnValue('valid-token');

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual(mockUser);
      expect(response.body.message).toBe('Token有效');
    });
  });
});