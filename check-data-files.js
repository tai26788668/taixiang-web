/**
 * 檢查資料檔案位置和狀態
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('資料檔案檢查');
console.log('='.repeat(60));
console.log('');

// 環境變數
console.log('環境變數:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || '未設定'}`);
console.log(`PERSISTENT_DISK_PATH: ${process.env.PERSISTENT_DISK_PATH || '未設定'}`);
console.log('');

// 可能的檔案位置
const possiblePaths = [
  {
    name: 'Persistent Disk',
    path: process.env.PERSISTENT_DISK_PATH 
      ? path.join(process.env.PERSISTENT_DISK_PATH, '請假系統個人資料.csv')
      : null
  },
  {
    name: 'Server data 目錄',
    path: path.join(__dirname, 'server/data/請假系統個人資料.csv')
  },
  {
    name: 'Server dist/data 目錄',
    path: path.join(__dirname, 'server/dist/data/請假系統個人資料.csv')
  },
  {
    name: '根目錄 data',
    path: path.join(__dirname, 'data/請假系統個人資料.csv')
  }
];

console.log('檢查檔案位置:');
console.log('');

let foundFiles = [];

possiblePaths.forEach(({ name, path: filePath }) => {
  if (!filePath) {
    console.log(`⏭️  ${name}: 路徑未設定`);
    return;
  }

  console.log(`檢查: ${name}`);
  console.log(`  路徑: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      
      console.log(`  ✅ 檔案存在`);
      console.log(`  📊 大小: ${stats.size} bytes`);
      console.log(`  📝 行數: ${lines}`);
      console.log(`  🕐 修改時間: ${stats.mtime.toISOString()}`);
      
      foundFiles.push({ name, path: filePath, stats, lines });
    } catch (error) {
      console.log(`  ❌ 無法讀取: ${error.message}`);
    }
  } else {
    console.log(`  ❌ 檔案不存在`);
  }
  
  console.log('');
});

console.log('='.repeat(60));
console.log('摘要');
console.log('='.repeat(60));
console.log(`找到 ${foundFiles.length} 個檔案`);
console.log('');

if (foundFiles.length === 0) {
  console.log('❌ 沒有找到任何資料檔案！');
  console.log('');
  console.log('建議:');
  console.log('1. 檢查 Persistent Disk 是否已掛載');
  console.log('2. 執行 force-init-disk.js 初始化資料');
  console.log('3. 確認建置腳本正確複製了 data 目錄');
} else {
  console.log('找到的檔案:');
  foundFiles.forEach(({ name, path, stats, lines }) => {
    console.log(`  ✅ ${name}`);
    console.log(`     路徑: ${path}`);
    console.log(`     大小: ${stats.size} bytes, 行數: ${lines}`);
  });
  
  console.log('');
  console.log('建議使用的檔案:');
  if (process.env.PERSISTENT_DISK_PATH && foundFiles.some(f => f.name === 'Persistent Disk')) {
    console.log('  👉 Persistent Disk (推薦)');
  } else if (foundFiles.some(f => f.name === 'Server dist/data 目錄')) {
    console.log('  👉 Server dist/data 目錄');
  } else {
    console.log(`  👉 ${foundFiles[0].name}`);
  }
}

console.log('='.repeat(60));
