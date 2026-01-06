import express from 'express';
import { authenticateUser, LoginCredentials } from '../services/authService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/auth/login
 * 使用者登入端點
 */
router.post('/login', async (req, res) => {
  try {
    const credentials: LoginCredentials = req.body;

    // 驗證必填欄位
    if (!credentials.employeeId || !credentials.password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '工號和密碼為必填欄位'
      });
    }

    // 驗證使用者憑證
    const result = await authenticateUser(credentials);

    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '系統錯誤，請稍後再試'
    });
  }
});

/**
 * POST /api/auth/logout
 * 使用者登出端點（客戶端處理token清除）
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

/**
 * GET /api/auth/verify
 * 驗證token有效性
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Token有效'
  });
});

export default router;