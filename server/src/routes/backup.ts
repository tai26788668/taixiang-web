import express from 'express';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * GET /api/backup/emergency-download
 * 緊急備份下載 API - 無需認證
 * 
 * 安全考量：
 * 1. 使用特殊的 User-Agent 標頭作為簡單驗證
 * 2. 限制 IP 來源（可選）
 * 3. 記錄所有下載行為
 * 4. 只允許下載特定的 CSV 文件
 */
router.get('/emergency-download', async (req: Request, res: Response) => {
  try {
    // 簡單的安全檢查 - 需要特定的 User-Agent
    const userAgent = req.headers['user-agent'];
    const expectedUserAgent = 'TaiXiang-Emergency-Backup-Tool';
    
    if (userAgent !== expectedUserAgent) {
      console.log(`[SECURITY] 未授權的緊急下載嘗試 - IP: ${req.ip}, User-Agent: ${userAgent}`);
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '未授權的存取'
      });
    }

    // 記錄下載行為
    const timestamp = new Date().toISOString();
    console.log(`[BACKUP] 緊急下載請求 - 時間: ${timestamp}, IP: ${req.ip}`);

    // 定義要下載的文件 - 優先使用 Persistent Disk
    // 如果設定了 PERSISTENT_DISK_PATH，從 Persistent Disk 讀取
    // 否則從 server/data 讀取
    let dataDir: string;
    if (process.env.PERSISTENT_DISK_PATH) {
      dataDir = process.env.PERSISTENT_DISK_PATH;
      console.log(`[BACKUP] 使用 Persistent Disk: ${dataDir}`);
    } else {
      // __dirname 在編譯後是 server/dist/routes
      // 所以 ../../data 指向 server/data
      dataDir = path.join(__dirname, '../../data');
      console.log(`[BACKUP] 使用本地資料目錄: ${dataDir}`);
    }
    
    const filesToDownload = [
      'leave_records.csv',
      'personal_data.csv'
    ];

    // 檢查文件是否存在
    const existingFiles: string[] = [];
    for (const fileName of filesToDownload) {
      const filePath = path.join(dataDir, fileName);
      if (fs.existsSync(filePath)) {
        existingFiles.push(fileName);
      }
    }

    if (existingFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NO_FILES',
        message: '找不到可下載的備份文件'
      });
    }

    // 獲取查詢參數來決定下載哪個文件
    const fileType = req.query.file as string;
    
    if (!fileType) {
      // 如果沒有指定文件，返回可用文件列表
      return res.json({
        success: true,
        data: {
          availableFiles: existingFiles,
          usage: '使用 ?file=leave-records 下載請假紀錄，或 ?file=personal-data 下載個人資料'
        },
        message: '可用的備份文件'
      });
    }

    let targetFile: string;
    let downloadName: string;

    switch (fileType) {
      case 'leave-records':
        targetFile = 'leave_records.csv';
        downloadName = `leave-records-backup-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'personal-data':
        targetFile = 'personal_data.csv';
        downloadName = `personal-data-backup-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_FILE_TYPE',
          message: '無效的文件類型。使用 leave-records 或 personal-data'
        });
    }

    if (!existingFiles.includes(targetFile)) {
      return res.status(404).json({
        success: false,
        error: 'FILE_NOT_FOUND',
        message: `文件 ${targetFile} 不存在`
      });
    }

    const filePath = path.join(dataDir, targetFile);
    
    // 檢查文件大小
    const stats = fs.statSync(filePath);
    console.log(`[BACKUP] 下載文件: ${targetFile}, 大小: ${stats.size} bytes`);

    // 設置下載標頭
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Length', stats.size);

    // 創建文件流並發送
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error(`[BACKUP] 文件讀取錯誤: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'FILE_READ_ERROR',
          message: '文件讀取失敗'
        });
      }
    });

    fileStream.on('end', () => {
      console.log(`[BACKUP] 文件下載完成: ${targetFile}`);
    });

    // 發送文件
    fileStream.pipe(res);

  } catch (error) {
    console.error('[BACKUP] 緊急下載錯誤:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: '系統錯誤，請稍後再試'
      });
    }
  }
});

/**
 * GET /api/backup/status
 * 檢查備份文件狀態 - 無需認證
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    // 同樣的安全檢查
    const userAgent = req.headers['user-agent'];
    const expectedUserAgent = 'TaiXiang-Emergency-Backup-Tool';
    
    if (userAgent !== expectedUserAgent) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '未授權的存取'
      });
    }

    // 優先使用 Persistent Disk
    let dataDir: string;
    if (process.env.PERSISTENT_DISK_PATH) {
      dataDir = process.env.PERSISTENT_DISK_PATH;
      console.log(`[BACKUP] 使用 Persistent Disk: ${dataDir}`);
    } else {
      dataDir = path.join(__dirname, '../../data');
      console.log(`[BACKUP] 使用本地資料目錄: ${dataDir}`);
    }
    
    const filesToCheck = [
      'leave_records.csv',
      'personal_data.csv'
    ];

    const fileStatus = filesToCheck.map(fileName => {
      const filePath = path.join(dataDir, fileName);
      console.log(`[BACKUP] 檢查文件: ${fileName}`);
      console.log(`[BACKUP] 完整路徑: ${filePath}`);
      const exists = fs.existsSync(filePath);
      console.log(`[BACKUP] 文件存在: ${exists}`);
      
      let stats = null;
      if (exists) {
        try {
          stats = fs.statSync(filePath);
          console.log(`[BACKUP] 文件大小: ${stats.size}`);
        } catch (error) {
          console.log(`[BACKUP] 讀取文件統計失敗: ${error}`);
          // 文件存在但無法讀取統計信息
        }
      }

      return {
        fileName,
        exists,
        size: stats ? stats.size : null,
        lastModified: stats ? stats.mtime.toISOString() : null
      };
    });

    res.json({
      success: true,
      data: {
        files: fileStatus,
        serverTime: new Date().toISOString()
      },
      message: '備份文件狀態'
    });

  } catch (error) {
    console.error('[BACKUP] 狀態檢查錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '系統錯誤'
    });
  }
});

export default router;