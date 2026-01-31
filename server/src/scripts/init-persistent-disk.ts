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
  '請假記錄.csv',
  '請假系統個人資料.csv'
];

async function initPersistentDisk() {
  console.log('='.repeat(60));
  console.log('Persistent Disk 初始化');
  console.log('='.repeat(60));
  console.log(`Disk 路徑: ${PERSISTENT_DISK_PATH}`);
  console.log(`來源路徑: ${SOURCE_DATA_PATH}`);
  console.log('');

  // 檢查 Persistent Disk 是否存在
  if (!fs.existsSync(PERSISTENT_DISK_PATH)) {
    console.error(`❌ Persistent Disk 不存在: ${PERSISTENT_DISK_PATH}`);
    console.error('請確認 Render Dashboard 中已正確設定 Disk');
    process.exit(1);
  }

  console.log('✅ Persistent Disk 已掛載');
  console.log('');

  // 複製檔案
  let copiedCount = 0;
  let skippedCount = 0;

  for (const fileName of FILES_TO_COPY) {
    const sourcePath = path.join(SOURCE_DATA_PATH, fileName);
    const destPath = path.join(PERSISTENT_DISK_PATH, fileName);

    // 檢查來源檔案是否存在
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  來源檔案不存在: ${fileName}`);
      continue;
    }

    // 檢查目標檔案是否已存在
    if (fs.existsSync(destPath)) {
      console.log(`⏭️  檔案已存在，跳過: ${fileName}`);
      skippedCount++;
      continue;
    }

    // 複製檔案
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ 複製成功: ${fileName}`);
      copiedCount++;
    } catch (error) {
      console.error(`❌ 複製失敗: ${fileName}`);
      console.error(error);
      process.exit(1);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('初始化完成');
  console.log(`複製: ${copiedCount} 個檔案`);
  console.log(`跳過: ${skippedCount} 個檔案`);
  console.log('='.repeat(60));
}

// 執行初始化
initPersistentDisk().catch(error => {
  console.error('初始化失敗:', error);
  process.exit(1);
});
