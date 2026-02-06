/**
 * Render 專用啟動腳本
 * 
 * 在啟動主應用程式之前，確保 Persistent Disk 已正確初始化
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PERSISTENT_DISK_PATH = process.env.PERSISTENT_DISK_PATH || '/mnt/data';
const REQUIRED_FILES = ['leave_records.csv', 'personal_data.csv'];

async function checkPersistentDisk() {
  console.log('🔍 檢查 Persistent Disk 狀態...');
  
  if (!fs.existsSync(PERSISTENT_DISK_PATH)) {
    console.log('❌ Persistent Disk 不存在，跳過檢查');
    return false;
  }
  
  console.log('✅ Persistent Disk 已掛載');
  
  // 檢查必要檔案
  let missingFiles = [];
  for (const fileName of REQUIRED_FILES) {
    const filePath = path.join(PERSISTENT_DISK_PATH, fileName);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(fileName);
    }
  }
  
  if (missingFiles.length > 0) {
    console.log(`❌ 缺少檔案: ${missingFiles.join(', ')}`);
    return false;
  }
  
  console.log('✅ 所有必要檔案都存在');
  return true;
}

async function runForceInit() {
  console.log('🔧 執行強制初始化...');
  
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['force-init-disk.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 強制初始化完成');
        resolve();
      } else {
        console.error(`❌ 強制初始化失敗，退出碼: ${code}`);
        reject(new Error(`Force init failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error('❌ 強制初始化錯誤:', error);
      reject(error);
    });
  });
}

async function startMainApp() {
  console.log('🚀 啟動主應用程式...');
  
  const child = spawn('node', ['server/dist/index.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('error', (error) => {
    console.error('❌ 主應用程式啟動失敗:', error);
    process.exit(1);
  });
  
  // 轉發信號
  process.on('SIGTERM', () => {
    console.log('收到 SIGTERM，正在關閉...');
    child.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('收到 SIGINT，正在關閉...');
    child.kill('SIGINT');
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('Render 啟動腳本');
  console.log('='.repeat(60));
  
  try {
    // 檢查 Persistent Disk
    const diskReady = await checkPersistentDisk();
    
    // 如果檔案缺失，執行強制初始化
    if (!diskReady && process.env.PERSISTENT_DISK_PATH) {
      await runForceInit();
    }
    
    // 啟動主應用程式
    await startMainApp();
    
  } catch (error) {
    console.error('❌ 啟動失敗:', error);
    process.exit(1);
  }
}

// 執行主函數
main();