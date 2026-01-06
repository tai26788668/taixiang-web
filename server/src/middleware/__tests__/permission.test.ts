import * as fc from 'fast-check';
import { Request, Response, NextFunction } from 'express';
import { requirePermission, requireAdmin, requireEmployee, requireSelfOrAdmin } from '../permission';
import { AuthUser } from '../../services/authService';

// Mock Express objects
const mockRequest = (user?: AuthUser, params?: any, body?: any, query?: any): Partial<Request> => ({
  user,
  params: params || {},
  body: body || {},
  query: query || {}
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('Permission Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property Tests', () => {
    /**
     * **Feature: employee-leave-system, Property 11: 權限控制**
     * 對於任何管理功能存取嘗試，系統應該驗證使用者權限，拒絕非管理者並重導向到登入頁面
     * **Validates: Requirements 4.1, 4.2**
     */
    test('Property 11: Permission control for admin functions', () => {
      fc.assert(
        fc.property(
          fc.record({
            employeeId: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
            name: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9\u4e00-\u9fff]/.test(c)), { minLength: 1, maxLength: 20 }),
            permission: fc.constantFrom('employee' as const, 'admin' as const)
          }),
          (user) => {
            const req = mockRequest(user) as Request;
            const res = mockResponse() as Response;
            const next = jest.fn();

            // 測試管理者權限要求
            const adminMiddleware = requireAdmin;
            adminMiddleware(req, res, next);

            if (user.permission === 'admin') {
              // 管理者應該被允許通過
              expect(next).toHaveBeenCalled();
              expect(res.status).not.toHaveBeenCalled();
              expect(res.json).not.toHaveBeenCalled();
            } else {
              // 非管理者應該被拒絕
              expect(next).not.toHaveBeenCalled();
              expect(res.status).toHaveBeenCalledWith(403);
              expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'INSUFFICIENT_PERMISSION',
                message: '權限不足，需要管理者權限'
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property 11: Permission control for unauthenticated users', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('employee' as const, 'admin' as const),
          (requiredPermission) => {
            // 測試未驗證的使用者
            const req = mockRequest() as Request; // 沒有使用者
            const res = mockResponse() as Response;
            const next = jest.fn();

            const middleware = requirePermission(requiredPermission);
            middleware(req, res, next);

            // 未驗證的使用者應該被拒絕
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
              success: false,
              error: 'INSUFFICIENT_PERMISSION',
              message: '未驗證的使用者'
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Property 11: Employee permission allows both employee and admin', () => {
      fc.assert(
        fc.property(
          fc.record({
            employeeId: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
            name: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9\u4e00-\u9fff]/.test(c)), { minLength: 1, maxLength: 20 }),
            permission: fc.constantFrom('employee' as const, 'admin' as const)
          }),
          (user) => {
            const req = mockRequest(user) as Request;
            const res = mockResponse() as Response;
            const next = jest.fn();

            requireEmployee(req, res, next);

            // 員工和管理者都應該被允許
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property 11: Self or admin access control', () => {
      fc.assert(
        fc.property(
          fc.record({
            employeeId: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
            name: fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9\u4e00-\u9fff]/.test(c)), { minLength: 1, maxLength: 20 }),
            permission: fc.constantFrom('employee' as const, 'admin' as const)
          }),
          fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
          (user, targetEmployeeId) => {
            const req = mockRequest(user, { employeeId: targetEmployeeId }) as Request;
            const res = mockResponse() as Response;
            const next = jest.fn();

            const middleware = requireSelfOrAdmin();
            middleware(req, res, next);

            if (user.permission === 'admin' || user.employeeId === targetEmployeeId) {
              // 管理者或存取自己資料的員工應該被允許
              expect(next).toHaveBeenCalled();
              expect(res.status).not.toHaveBeenCalled();
              expect(res.json).not.toHaveBeenCalled();
            } else {
              // 存取他人資料的員工應該被拒絕
              expect(next).not.toHaveBeenCalled();
              expect(res.status).toHaveBeenCalledWith(403);
              expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'INSUFFICIENT_PERMISSION',
                message: '只能存取自己的資料'
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    test('should allow admin to access admin-required endpoints', () => {
      const adminUser: AuthUser = {
        employeeId: 'ADMIN001',
        name: '管理員',
        permission: 'admin'
      };

      const req = mockRequest(adminUser) as Request;
      const res = mockResponse() as Response;

      requireAdmin(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny employee access to admin-required endpoints', () => {
      const employeeUser: AuthUser = {
        employeeId: 'EMP001',
        name: '員工',
        permission: 'employee'
      };

      const req = mockRequest(employeeUser) as Request;
      const res = mockResponse() as Response;

      requireAdmin(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('should allow employee to access their own data', () => {
      const employeeUser: AuthUser = {
        employeeId: 'EMP001',
        name: '員工',
        permission: 'employee'
      };

      const req = mockRequest(employeeUser, { employeeId: 'EMP001' }) as Request;
      const res = mockResponse() as Response;

      const middleware = requireSelfOrAdmin();
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny employee access to other employee data', () => {
      const employeeUser: AuthUser = {
        employeeId: 'EMP001',
        name: '員工',
        permission: 'employee'
      };

      const req = mockRequest(employeeUser, { employeeId: 'EMP002' }) as Request;
      const res = mockResponse() as Response;

      const middleware = requireSelfOrAdmin();
      middleware(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});