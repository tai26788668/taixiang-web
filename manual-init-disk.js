/**
 * 手動 Persistent Disk 初始化腳本
 * 
 * 當自動初始化失敗時，可以手動執行此腳本
 * 
 * 使用方法:
 *   node manual-init-disk.js
 */

const fs = require('fs');
const path = require('path');

const PERSISTENT_DISK_PATH = process.env.PERSISTENT_DISK_PATH || '/mnt/data';
const SOURCE_DATA_PATH = path.join(__dirname, 'server/data');

const FILES_TO_COPY = [
  '請假記錄.csv',
  '請假系統個人資料.csv'
];

async function manualInitPersistentDisk() {
  console.log('='.repeat(60));
  console.log('手動 Persistent Disk 初始化');
  console.log('='.repeat(60));
  console.log(`Disk 路徑: ${PERSISTENT_DISK_PATH}`);
  console.log(`來源路徑: ${SOURCE_DATA_PATH}`);
  console.log(`當前目錄: ${process.cwd()}`);
  console.log('');

  // 檢查環境變數
  if (!process.env.PERSISTENT_DISK_PATH) {
    console.log('⚠️  PERSISTENT_DISK_PATH 環境變數未設定');
    console.log('   請在 Render Dashboard 中設定: PERSISTENT_DISK_PATH=/mnt/data');
    return;
  }

  // 檢查 Persistent Disk 是否存在
  if (!fs.existsSync(PERSISTENT_DISK_PATH)) {
    console.error(`❌ Persistent Disk 不存在: ${PERSISTENT_DISK_PATH}`);
    console.error('');
    console.error('請確認:');
    console.error('1. Render Dashboard 中已創建 Persistent Disk');
    console.error('2. Mount Path 設為: /mnt/data');
    console.error('3. Disk 狀態為 "Available"');
    console.error('4. 服務已重新部署');
    return;
  }

  console.log('✅ Persistent Disk 已掛載');

  // 檢查來源資料目錄
  if (!fs.existsSync(SOURCE_DATA_PATH)) {
    console.error(`❌ 來源資料目錄不存在: ${SOURCE_DATA_PATH}`);
    
    // 嘗試其他可能的路徑
    const alternativePaths = [
      path.join(__dirname, 'data'),
      path.join(process.cwd(), 'server/data'),
      path.join(process.cwd(), 'data')
    ];
    
    console.log('');
    console.log('嘗試其他路徑:');
    for (const altPath of alternativePaths) {
      console.log(`  檢查: ${altPath}`);
      if (fs.existsSync(altPath)) {
        console.log(`  ✅ 找到: ${altPath}`);
        SOURCE_DATA_PATH = altPath;
        break;
      } else {
        console.log(`  ❌ 不存在`);
      }
    }
    
    if (!fs.existsSync(SOURCE_DATA_PATH)) {
      console.error('');
      console.error('❌ 找不到來源資料目錄');
      return;
    }
  }

  console.log('✅ 來源資料目錄存在');
  console.log('');

  // 列出來源目錄內容
  try {
    const sourceFiles = fs.readdirSync(SOURCE_DATA_PATH);
    console.log('📁 來源目錄內容:');
    sourceFiles.forEach(file => {
      const filePath = path.join(SOURCE_DATA_PATH, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${file} (${stats.size} bytes)`);
    });
    console.log('');
  } catch (error) {
    console.error('無法讀取來源目錄:', error);
  }

  // 複製檔案
  let copiedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const fileName of FILES_TO_COPY) {
    const sourcePath = path.join(SOURCE_DATA_PATH, fileName);
    const destPath = path.join(PERSISTENT_DISK_PATH, fileName);

    console.log(`處理檔案: ${fileName}`);
    console.log(`  來源: ${sourcePath}`);
    console.log(`  目標: ${destPath}`);

    // 檢查來源檔案是否存在
    if (!fs.existsSync(sourcePath)) {
      console.warn(`  ⚠️  來源檔案不存在，跳過`);
      errorCount++;
      continue;
    }

    // 檢查目標檔案是否已存在
    if (fs.existsSync(destPath)) {
      console.log(`  ⏭️  檔案已存在，跳過`);
      skippedCount++;
      continue;
    }

    // 複製檔案
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✅ 複製成功`);
      copiedCount++;
      
      // 驗證複製結果
      if (fs.existsSync(destPath)) {
        const sourceStats = fs.statSync(sourcePath);
        const destStats = fs.statSync(destPath);
        console.log(`  📊 檔案大小: ${sourceStats.size} bytes -> ${destStats.size} bytes`);
      }
    } catch (error) {
      console.error(`  ❌ 複製失敗: ${error}`);
      errorCount++;
    }
    
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('手動初始化完成');
  console.log(`✅ 複製成功: ${copiedCount} 個檔案`);
  console.log(`⏭️  跳過: ${skippedCount} 個檔案`);
  if (errorCount > 0) {
    console.log(`❌ 錯誤: ${errorCount} 個檔案`);
  }
  console.log('='.repeat(60));
  
  // 列出 Persistent Disk 內容
  try {
    const diskFiles = fs.readdirSync(PERSISTENT_DISK_PATH);
    console.log('📁 Persistent Disk 最終內容:');
    diskFiles.forEach(file => {
      const filePath = path.join(PERSISTENT_DISK_PATH, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${file} (${stats.size} bytes)`);
    });
  } catch (error) {
    console.error('無法讀取 Persistent Disk 內容:', error);
  }
  
  console.log('='.repeat(60));
}

// 執行手動初始化
manualInitPersistentDisk().catch(error => {
  console.error('手動初始化失敗:', error);
  process.exit(1);
});