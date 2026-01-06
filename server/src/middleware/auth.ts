import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, AuthUser } from '../services/authService';

// 使用全域的Express Request擴展

/**
 * JWT驗證中介軟體
 * 驗證請求中的JWT token並將使用者資訊附加到request物件
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: '未提供驗證token'
    });
  }

  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_EXPIRED',
      message: 'Token已過期或無效'
    });
  }

  // 將使用者資訊附加到request物件
  req.user = user;
  next();
}

/**
 * 可選的JWT驗證中介軟體
 * 如果提供了token則驗證，但不強制要求
 */
export function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}