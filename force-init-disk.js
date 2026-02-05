/**
 * 強制 Persistent Disk 初始化腳本
 * 
 * 此腳本會強制將 CSV 資料複製到 Persistent Disk，即使檔案已存在也會覆蓋
 * 
 * 使用方法:
 *   node force-init-disk.js
 */

const fs = require('fs');
const path = require('path');

const PERSISTENT_DISK_PATH = process.env.PERSISTENT_DISK_PATH || '/mnt/data';

// 嘗試多個可能的來源路徑
const possibleSourcePaths = [
  path.join(__dirname, 'server/data'),
  path.join(__dirname, 'data'),
  path.join(process.cwd(), 'server/data'),
  path.join(process.cwd(), 'data'),
  path.join(__dirname, 'server/dist/data'),
  '/app/server/data',
  '/app/data'
];

const FILES_TO_COPY = [
  '請假記錄.csv',
  '請假系統個人資料.csv'
];

async function forceInitPersistentDisk() {
  console.log('='.repeat(60));
  console.log('強制 Persistent Disk 初始化');
  console.log('='.repeat(60));
  console.log(`目標路徑: ${PERSISTENT_DISK_PATH}`);
  console.log(`當前工作目錄: ${process.cwd()}`);
  console.log(`腳本位置: ${__dirname}`);
  console.log('');

  // 檢查環境變數
  console.log('環境變數檢查:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || '未設定'}`);
  console.log(`PERSISTENT_DISK_PATH: ${process.env.PERSISTENT_DISK_PATH || '未設定'}`);
  console.log('');

  // 檢查 Persistent Disk 是否存在
  if (!fs.existsSync(PERSISTENT_DISK_PATH)) {
    console.error(`❌ Persistent Disk 不存在: ${PERSISTENT_DISK_PATH}`);
    console.error('');
    console.error('請確認:');
    console.error('1. Render Dashboard 中已創建 Persistent Disk');
    console.error('2. Mount Path 設為: /mnt/data');
    console.error('3. 環境變數 PERSISTENT_DISK_PATH=/mnt/data');
    console.error('4. Disk 狀態為 "Available"');
    console.error('5. 服務已重新部署');
    return;
  }

  console.log('✅ Persistent Disk 已掛載');

  // 嘗試創建目錄（如果不存在）
  try {
    if (!fs.existsSync(PERSISTENT_DISK_PATH)) {
      fs.mkdirSync(PERSISTENT_DISK_PATH, { recursive: true });
      console.log(`✅ 創建目錄: ${PERSISTENT_DISK_PATH}`);
    }
  } catch (error) {
    console.error(`❌ 無法創建目錄: ${error.message}`);
  }

  // 尋找來源資料目錄
  let foundSourcePath = null;
  
  console.log('尋找來源資料目錄:');
  for (const sourcePath of possibleSourcePaths) {
    console.log(`  檢查: ${sourcePath}`);
    
    if (fs.existsSync(sourcePath)) {
      console.log('    ✅ 目錄存在');
      
      // 檢查是否包含必要檔案
      const hasAllFiles = FILES_TO_COPY.every(fileName => {
        const filePath = path.join(sourcePath, fileName);
        return fs.existsSync(filePath);
      });
      
      if (hasAllFiles) {
        foundSourcePath = sourcePath;
        console.log(`    ✅ 找到完整資料: ${sourcePath}`);
        break;
      } else {
        console.log('    ❌ 缺少必要檔案');
        // 列出目錄內容
        try {
          const files = fs.readdirSync(sourcePath);
          console.log(`    📁 目錄內容: ${files.join(', ')}`);
        } catch (error) {
          console.log(`    ❌ 無法讀取目錄: ${error.message}`);
        }
      }
    } else {
      console.log('    ❌ 目錄不存在');
    }
  }
  
  if (!foundSourcePath) {
    console.error('');
    console.error('❌ 找不到來源資料目錄');
    console.error('請確認 CSV 檔案存在於以下任一位置:');
    possibleSourcePaths.forEach(p => console.error(`  - ${p}`));
    return;
  }

  console.log('');
  console.log(`✅ 使用來源路徑: ${foundSourcePath}`);
  console.log('');

  // 強制複製檔案
  let copiedCount = 0;
  let errorCount = 0;

  for (const fileName of FILES_TO_COPY) {
    const sourcePath = path.join(foundSourcePath, fileName);
    const destPath = path.join(PERSISTENT_DISK_PATH, fileName);

    console.log(`處理檔案: ${fileName}`);
    console.log(`  來源: ${sourcePath}`);
    console.log(`  目標: ${destPath}`);

    // 檢查來源檔案
    if (!fs.existsSync(sourcePath)) {
      console.warn(`  ⚠️  來源檔案不存在，跳過`);
      errorCount++;
      continue;
    }

    // 如果目標檔案存在，先備份
    if (fs.existsSync(destPath)) {
      const backupPath = `${destPath}.backup.${Date.now()}`;
      try {
        fs.copyFileSync(destPath, backupPath);
        console.log(`  📋 備份現有檔案: ${backupPath}`);
      } catch (error) {
        console.warn(`  ⚠️  無法備份現有檔案: ${error.message}`);
      }
    }

    // 強制複製檔案
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✅ 強制複製成功`);
      copiedCount++;
      
      // 驗證複製結果
      if (fs.existsSync(destPath)) {
        const sourceStats = fs.statSync(sourcePath);
        const destStats = fs.statSync(destPath);
        console.log(`  📊 檔案大小: ${sourceStats.size} bytes -> ${destStats.size} bytes`);
        
        // 設定檔案權限
        try {
          fs.chmodSync(destPath, 0o644);
          console.log(`  🔒 設定檔案權限: 644`);
        } catch (error) {
          console.warn(`  ⚠️  無法設定權限: ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`  ❌ 複製失敗: ${error.message}`);
      errorCount++;
    }
    
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('強制初始化完成');
  console.log(`✅ 複製成功: ${copiedCount} 個檔案`);
  if (errorCount > 0) {
    console.log(`❌ 錯誤: ${errorCount} 個檔案`);
  }
  console.log('='.repeat(60));
  
  // 列出 Persistent Disk 最終內容
  try {
    console.log('📁 Persistent Disk 最終內容:');
    const diskFiles = fs.readdirSync(PERSISTENT_DISK_PATH);
    if (diskFiles.length === 0) {
      console.log('   (空目錄)');
    } else {
      diskFiles.forEach(file => {
        const filePath = path.join(PERSISTENT_DISK_PATH, file);
        try {
          const stats = fs.statSync(filePath);
          const isDir = stats.isDirectory();
          const size = isDir ? '(目錄)' : `${stats.size} bytes`;
          const modified = stats.mtime.toISOString();
          console.log(`   ${file} ${size} (${modified})`);
        } catch (error) {
          console.log(`   ${file} (無法讀取資訊)`);
        }
      });
    }
  } catch (error) {
    console.error('無法讀取 Persistent Disk 內容:', error.message);
  }
  
  console.log('='.repeat(60));
  
  // 測試檔案讀取
  console.log('測試檔案讀取:');
  for (const fileName of FILES_TO_COPY) {
    const filePath = path.join(PERSISTENT_DISK_PATH, fileName);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      console.log(`✅ ${fileName}: ${lines} 行`);
    } catch (error) {
      console.error(`❌ ${fileName}: 無法讀取 - ${error.message}`);
    }
  }
  
  console.log('='.repeat(60));
}

// 執行強制初始化
forceInitPersistentDisk().catch(error => {
  console.error('強制初始化失敗:', error);
  process.exit(1);
});