/**
 * Email API Routes
 * 處理郵件發送相關的 API
 */

import express from 'express';
import path from 'path';
import { sendLeaveRecordEmail, verifyGmailConfig } from '../services/emailService';

const router = express.Router();

/**
 * POST /api/email/send-leave-record
 * 發送請假記錄 CSV 到指定 email
 */
router.post('/send-leave-record', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 收到發送請假記錄郵件請求`);

  try {
    // 取得收件人 email（從環境變數或請求參數）
    const recipientEmail = process.env.BACKUP_EMAIL || 'tai26788668@gmail.com';

    // 取得 CSV 檔案路徑
    const csvFilePath = process.env.PERSISTENT_DISK_PATH
      ? path.join(process.env.PERSISTENT_DISK_PATH, 'leave_records.csv')
      : path.join(__dirname, '../../data/leave_records.csv');

    console.log(`發送郵件到: ${recipientEmail}`);
    console.log(`CSV 檔案路徑: ${csvFilePath}`);

    // 發送郵件
    await sendLeaveRecordEmail(recipientEmail, csvFilePath);

    const processingTime = Date.now() - startTime;
    console.log(`郵件發送成功，耗時: ${processingTime}ms`);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      recipient: recipientEmail,
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`郵件發送失敗 (耗時: ${processingTime}ms):`, error);

    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/email/verify-config
 * 驗證 Gmail 設定是否正確
 */
router.get('/verify-config', async (req, res) => {
  try {
    const isValid = await verifyGmailConfig();

    res.status(200).json({
      success: true,
      configured: isValid,
      message: isValid ? 'Gmail configuration is valid' : 'Gmail configuration is invalid'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      configured: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
