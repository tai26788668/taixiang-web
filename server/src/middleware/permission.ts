import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../services/authService';

/**
 * 權限檢查中介軟體
 * 確保使用者具有指定的權限等級
 */
export function requirePermission(requiredPermission: 'employee' | 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;

    // 檢查使用者是否已驗證
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSION',
        message: '未驗證的使用者'
      });
    }

    // 檢查權限等級
    if (requiredPermission === 'admin' && user.permission !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSION',
        message: '權限不足，需要管理者權限'
      });
    }

    // 權限檢查通過
    next();
  };
}

/**
 * 管理者權限檢查中介軟體
 * 確保使用者具有管理者權限
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requirePermission('admin')(req, res, next);
}

/**
 * 簡單的管理者權限檢查中介軟體
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = req.user as AuthUser;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: '未驗證的使用者'
    });
  }

  if (user.permission !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '權限不足，需要管理者權限'
    });
  }

  next();
}

/**
 * 員工權限檢查中介軟體
 * 確保使用者至少具有員工權限（員工或管理者都可以）
 */
export function requireEmployee(req: Request, res: Response, next: NextFunction) {
  const user = req.user as AuthUser;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'INSUFFICIENT_PERMISSION',
      message: '未驗證的使用者'
    });
  }

  // 員工和管理者都可以存取員工功能
  if (user.permission === 'employee' || user.permission === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'INSUFFICIENT_PERMISSION',
    message: '權限不足'
  });
}

/**
 * 檢查使用者是否只能存取自己的資料
 * 管理者可以存取所有資料，員工只能存取自己的資料
 */
export function requireSelfOrAdmin(employeeIdParam: string = 'employeeId') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;
    const targetEmployeeId = req.params[employeeIdParam] || req.body.employeeId || req.query.employeeId;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSION',
        message: '未驗證的使用者'
      });
    }

    // 管理者可以存取所有資料
    if (user.permission === 'admin') {
      return next();
    }

    // 員工只能存取自己的資料
    if (user.permission === 'employee' && user.employeeId === targetEmployeeId) {
      return next();
    }

    // 如果沒有指定目標員工ID，則允許存取（通常用於查詢自己的資料）
    if (!targetEmployeeId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'INSUFFICIENT_PERMISSION',
      message: '只能存取自己的資料'
    });
  };
}