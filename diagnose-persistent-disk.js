/**
 * Persistent Disk 診斷腳本
 * 
 * 檢查 Persistent Disk 設定和狀態
 * 
 * 使用方法:
 *   node diagnose-persistent-disk.js
 */

const fs = require('fs');
const path = require('path');

function diagnosePersistentDisk() {
  console.log('='.repeat(60));
  console.log('Persistent Disk 診斷');
  console.log('='.repeat(60));
  console.log(`診斷時間: ${new Date().toISOString()}`);
  console.log('');

  // 1. 檢查環境變數
  console.log('1. 環境變數檢查');
  console.log('-'.repeat(30));
  console.log(`NODE_ENV: ${process.env.NODE_ENV || '未設定'}`);
  console.log(`PERSISTENT_DISK_PATH: ${process.env.PERSISTENT_DISK_PATH || '未設定'}`);
  console.log(`當前工作目錄: ${process.cwd()}`);
  console.log('');

  const PERSISTENT_DISK_PATH = process.env.PERSISTENT_DISK_PATH || '/mnt/data';
  const possibleSourcePaths = [
    path.join(__dirname, 'server/data'),
    path.join(__dirname, 'data'),
    path.join(process.cwd(), 'server/data'),
    path.join(process.cwd(), 'data')
  ];

  // 2. 檢查 Persistent Disk
  console.log('2. Persistent Disk 檢查');
  console.log('-'.repeat(30));
  console.log(`目標路徑: ${PERSISTENT_DISK_PATH}`);
  
  if (fs.existsSync(PERSISTENT_DISK_PATH)) {
    console.log('✅ Persistent Disk 存在');
    
    try {
      const stats = fs.statSync(PERSISTENT_DISK_PATH);
      console.log(`   類型: ${stats.isDirectory() ? '目錄' : '檔案'}`);
      console.log(`   權限: ${stats.mode.toString(8)}`);
      
      if (stats.isDirectory()) {
        const files = fs.readdirSync(PERSISTENT_DISK_PATH);
        console.log(`   內容 (${files.length} 個項目):`);
        files.forEach(file => {
          const filePath = path.join(PERSISTENT_DISK_PATH, file);
          const fileStats = fs.statSync(filePath);
          console.log(`     ${file} (${fileStats.size} bytes)`);
        });
      }
    } catch (error) {
      console.log(`❌ 無法讀取 Persistent Disk 資訊: ${error.message}`);
    }
  } else {
    console.log('❌ Persistent Disk 不存在');
    console.log('   可能原因:');
    console.log('   - Render Dashboard 中未創建 Persistent Disk');
    console.log('   - Mount Path 設定錯誤');
    console.log('   - Disk 未正確掛載');
  }
  console.log('');

  // 3. 檢查來源資料
  console.log('3. 來源資料檢查');
  console.log('-'.repeat(30));
  
  let foundSourcePath = null;
  
  for (const sourcePath of possibleSourcePaths) {
    console.log(`檢查: ${sourcePath}`);
    
    if (fs.existsSync(sourcePath)) {
      console.log('  ✅ 目錄存在');
      foundSourcePath = sourcePath;
      
      try {
        const files = fs.readdirSync(sourcePath);
        console.log(`  📁 內容 (${files.length} 個項目):`);
        files.forEach(file => {
          const filePath = path.join(sourcePath, file);
          const stats = fs.statSync(filePath);
          console.log(`     ${file} (${stats.size} bytes)`);
        });
      } catch (error) {
        console.log(`  ❌ 無法讀取目錄: ${error.message}`);
      }
      break;
    } else {
      console.log('  ❌ 目錄不存在');
    }
  }
  
  if (!foundSourcePath) {
    console.log('');
    console.log('❌ 找不到來源資料目錄');
  }
  console.log('');

  // 4. 檢查必要檔案
  console.log('4. 必要檔案檢查');
  console.log('-'.repeat(30));
  
  const requiredFiles = ['請假記錄.csv', '請假系統個人資料.csv'];
  
  if (foundSourcePath) {
    requiredFiles.forEach(fileName => {
      const filePath = path.join(foundSourcePath, fileName);
      console.log(`檢查: ${fileName}`);
      
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✅ 存在 (${stats.size} bytes)`);
      } else {
        console.log(`  ❌ 不存在`);
      }
    });
  } else {
    console.log('⏭️  跳過 (找不到來源目錄)');
  }
  console.log('');

  // 5. 建議
  console.log('5. 建議');
  console.log('-'.repeat(30));
  
  if (!process.env.PERSISTENT_DISK_PATH) {
    console.log('❗ 設定環境變數: PERSISTENT_DISK_PATH=/mnt/data');
  }
  
  if (!fs.existsSync(PERSISTENT_DISK_PATH)) {
    console.log('❗ 在 Render Dashboard 創建並掛載 Persistent Disk');
  }
  
  if (!foundSourcePath) {
    console.log('❗ 確認來源資料檔案存在於正確位置');
  }
  
  if (fs.existsSync(PERSISTENT_DISK_PATH) && foundSourcePath) {
    console.log('✅ 可以執行手動初始化: node manual-init-disk.js');
  }
  
  console.log('');
  console.log('='.repeat(60));
}

// 執行診斷
diagnosePersistentDisk();