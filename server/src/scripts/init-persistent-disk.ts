/**
 * Persistent Disk 初始化腳本
 * 
 * 此腳本會在首次部署時執行，將初始 CSV 資料複製到 Persistent Disk
 * 如果 Disk 中已有資料，則不會覆蓋
 */

import fs from 'fs';
import path from 'path';

const PERSISTENT_DISK_PATH = process.env.PERSISTENT_DISK_PATH || '/mnt/data';
const SOURCE_DATA_PATH = path.join(__dirname, '../../data');

const FILES_TO_COPY = [
  'leave_records.csv',
  'personal_data.csv'
];

async function initPersistentDisk() {
  console.log('='.repeat(60));
  console.log('Persistent Disk 初始化');
  console.log('='.repeat(60));
  console.log(`Disk 路徑: ${PERSISTENT_DISK_PATH}`);
  console.log(`來源路徑: ${SOURCE_DATA_PATH}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log('');

  // 檢查是否在生產環境且有設定 PERSISTENT_DISK_PATH
  if (!process.env.PERSISTENT_DISK_PATH) {
    console.log('⏭️  PERSISTENT_DISK_PATH 未設定，跳過初始化');
    console.log('   這是正常的本地開發行為');
    console.log('='.repeat(60));
    return;
  }

  // 檢查 Persistent Disk 是否存在
  if (!fs.existsSync(PERSISTENT_DISK_PATH)) {
    console.error(`❌ Persistent Disk 不存在: ${PERSISTENT_DISK_PATH}`);
    console.error('請確認 Render Dashboard 中已正確設定 Disk');
    console.error('');
    console.error('設定步驟:');
    console.error('1. 在 Render Dashboard 創建 Persistent Disk');
    console.error('2. Mount Path 設為: /mnt/data');
    console.error('3. 設定環境變數: PERSISTENT_DISK_PATH=/mnt/data');
    console.error('4. 重新部署服務');
    process.exit(1);
  }

  console.log('✅ Persistent Disk 已掛載');
  
  // 檢查來源資料目錄
  if (!fs.existsSync(SOURCE_DATA_PATH)) {
    console.error(`❌ 來源資料目錄不存在: ${SOURCE_DATA_PATH}`);
    process.exit(1);
  }
  
  console.log('✅ 來源資料目錄存在');
  console.log('');

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
  console.log('初始化完成');
  console.log(`✅ 複製成功: ${copiedCount} 個檔案`);
  console.log(`⏭️  跳過: ${skippedCount} 個檔案`);
  if (errorCount > 0) {
    console.log(`❌ 錯誤: ${errorCount} 個檔案`);
  }
  console.log('='.repeat(60));
  
  // 列出 Persistent Disk 內容
  try {
    const diskFiles = fs.readdirSync(PERSISTENT_DISK_PATH);
    console.log('📁 Persistent Disk 內容:');
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

// 執行初始化
initPersistentDisk().catch(error => {
  console.error('初始化失敗:', error);
  process.exit(1);
});
