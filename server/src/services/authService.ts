import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PersonalData } from '../types';
import { validateCredentials } from './personalDataService';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = '24h';

export interface AuthUser {
  employeeId: string;
  name: string;
  permission: string;
}

export interface LoginCredentials {
  employeeId: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: AuthUser;
  };
  message?: string;
}

/**
 * 驗證使用者登入憑證
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { employeeId, password } = credentials;

    // 使用personalDataService的validateCredentials函數來驗證憑證
    const personalData = await validateCredentials(employeeId, password);
    
    if (!personalData) {
      return {
        success: false,
        message: '工號或密碼錯誤'
      };
    }

    // 建立使用者物件
    const user: AuthUser = {
      employeeId: personalData.employeeId,
      name: personalData.name,
      permission: personalData.permission
    };

    // 生成JWT token
    const token = generateToken(user);

    return {
      success: true,
      data: {
        token,
        user
      },
      message: '登入成功'
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: '系統錯誤，請稍後再試'
    };
  }
}

/**
 * 生成JWT token
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      employeeId: user.employeeId,
      name: user.name,
      permission: user.permission
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * 驗證JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      employeeId: decoded.employeeId,
      name: decoded.name,
      permission: decoded.permission
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * 從Authorization header中提取token
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // 移除 "Bearer " 前綴
}