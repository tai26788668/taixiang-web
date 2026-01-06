import * as fc from 'fast-check';
import bcrypt from 'bcryptjs';
import { authenticateUser, generateToken, verifyToken, extractTokenFromHeader } from '../authService';
import { PersonalData } from '../../types';
import * as personalDataService from '../personalDataService';

// Mock personalDataService
jest.mock('../personalDataService');
const mockedPersonalDataService = personalDataService as jest.Mocked<typeof personalDataService>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property Tests', () => {
    /**
     * **Feature: employee-leave-system, Property 2: 登入憑證驗證**
     * 對於任何登入嘗試，系統應該根據個人資料CSV中的記錄正確驗證工號和密碼組合
     * **Validates: Requirements 1.2**
     */
    test('Property 2: Login credential verification', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            employeeId: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
            password: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 20 }),
            name: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9\u4e00-\u9fff]/.test(c)), { minLength: 1, maxLength: 20 }),
            permission: fc.constantFrom('employee' as const, 'admin' as const)
          }),
          fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 20 }),
          async (validUser, wrongPassword) => {
            // 設定有效使用者資料（密碼已加密）
            const hashedPassword = await bcrypt.hash(validUser.password, 10);
            const personalData: PersonalData = {
              ...validUser,
              password: hashedPassword,
              annualLeave: 14.0,
              sickLeave: 30.0,
              menstrualLeave: 3.0
            };

            // 測試正確的憑證
            mockedPersonalDataService.validateCredentials.mockResolvedValue(personalData);
            
            const validResult = await authenticateUser({
              employeeId: validUser.employeeId,
              password: validUser.password
            });

            // 正確憑證應該成功
            expect(validResult.success).toBe(true);
            expect(validResult.data?.token).toBeDefined();
            expect(validResult.data?.user).toEqual({
              employeeId: validUser.employeeId,
              name: validUser.name,
              permission: validUser.permission
            });

            // 測試錯誤的密碼（假設錯誤密碼與正確密碼不同）
            if (wrongPassword !== validUser.password) {
              mockedPersonalDataService.validateCredentials.mockResolvedValue(null);
              
              const invalidResult = await authenticateUser({
                employeeId: validUser.employeeId,
                password: wrongPassword
              });

              // 錯誤憑證應該失敗
              expect(invalidResult.success).toBe(false);
              expect(invalidResult.data?.token).toBeUndefined();
              expect(invalidResult.data?.user).toBeUndefined();
            }

            // 測試不存在的使用者
            mockedPersonalDataService.validateCredentials.mockResolvedValue(null);
            
            const nonExistentResult = await authenticateUser({
              employeeId: 'nonexistent',
              password: 'anypassword'
            });

            // 不存在的使用者應該失敗
            expect(nonExistentResult.success).toBe(false);
            expect(nonExistentResult.data?.token).toBeUndefined();
            expect(nonExistentResult.data?.user).toBeUndefined();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Unit Tests', () => {
    test('should generate and verify JWT tokens correctly', () => {
      const user = {
        employeeId: 'EMP001',
        name: '測試員工',
        permission: 'employee' as const
      };

      const token = generateToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const verifiedUser = verifyToken(token);
      expect(verifiedUser).toEqual(user);
    });

    test('should return null for invalid tokens', () => {
      const invalidToken = 'invalid.token.here';
      const result = verifyToken(invalidToken);
      expect(result).toBeNull();
    });

    test('should extract token from Authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
    });

    test('should return null for invalid Authorization header', () => {
      expect(extractTokenFromHeader(undefined)).toBeNull();
      expect(extractTokenFromHeader('InvalidHeader')).toBeNull();
      expect(extractTokenFromHeader('Basic token')).toBeNull();
    });

    test('should handle authentication service errors gracefully', async () => {
      mockedPersonalDataService.validateCredentials.mockRejectedValue(new Error('Database error'));

      const result = await authenticateUser({
        employeeId: 'EMP001',
        password: 'password'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('系統錯誤，請稍後再試');
    });
  });
});