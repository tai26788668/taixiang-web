/**
 * Email 服務
 * 使用 nodemailer 發送郵件
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

/**
 * 建立 Gmail 傳輸器
 */
function createGmailTransporter() {
  const email = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!email || !password) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password
    }
  });
}

/**
 * 發送請假記錄 CSV 郵件
 * @param recipientEmail 收件人 email
 * @param csvFilePath CSV 檔案路徑
 * @returns Promise<void>
 */
export async function sendLeaveRecordEmail(
  recipientEmail: string,
  csvFilePath: string
): Promise<void> {
  try {
    // 檢查檔案是否存在
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    // 建立傳輸器
    const transporter = createGmailTransporter();

    // 取得當前日期
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const taiwanDate = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 台灣時間
    const taiwanDateStr = taiwanDate.toISOString().split('T')[0];

    // 郵件選項
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      subject: `請假記錄備份 - ${taiwanDateStr}`,
      text: `
親愛的管理員，

這是系統自動發送的每週請假記錄備份。

備份日期：${taiwanDateStr}
檔案名稱：請假記錄.csv

請妥善保存此備份檔案。

---
泰祥食品請假系統
自動發送，請勿回覆
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">請假記錄備份</h2>
          <p>親愛的管理員，</p>
          <p>這是系統自動發送的每週請假記錄備份。</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5;"><strong>備份日期</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${taiwanDateStr}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5;"><strong>檔案名稱</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">請假記錄.csv</td>
            </tr>
          </table>
          <p>請妥善保存此備份檔案。</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            泰祥食品請假系統<br>
            自動發送，請勿回覆
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `請假記錄_${taiwanDateStr}.csv`,
          path: csvFilePath
        }
      ]
    };

    // 發送郵件
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * 驗證 Gmail 設定
 * @returns Promise<boolean>
 */
export async function verifyGmailConfig(): Promise<boolean> {
  try {
    const transporter = createGmailTransporter();
    await transporter.verify();
    console.log('Gmail configuration is valid');
    return true;
  } catch (error) {
    console.error('Gmail configuration is invalid:', error);
    return false;
  }
}
