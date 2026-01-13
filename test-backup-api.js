// 緊急備份 API 測試腳本
const https = require('https');
const http = require('http');

// 配置
const config = {
  // 修改為您的伺服器地址
  host: 'localhost',
  port: 10000,
  protocol: 'http', // 本地測試使用 http，生產環境使用 https
  userAgent: 'TaiXiang-Emergency-Backup-Tool'
};

// 測試函數
async function testBackupAPI() {
  console.log('🧪 開始測試緊急備份 API...\n');

  // 測試 1: 檢查備份狀態
  console.log('📋 測試 1: 檢查備份文件狀態');
  try {
    const statusResult = await makeRequest('/api/backup/status');
    console.log('✅ 狀態檢查成功:');
    console.log(JSON.stringify(statusResult, null, 2));
  } catch (error) {
    console.log('❌ 狀態檢查失敗:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 2: 獲取可用文件列表
  console.log('📂 測試 2: 獲取可用文件列表');
  try {
    const listResult = await makeRequest('/api/backup/emergency-download');
    console.log('✅ 文件列表獲取成功:');
    console.log(JSON.stringify(listResult, null, 2));
  } catch (error) {
    console.log('❌ 文件列表獲取失敗:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 3: 測試下載請假紀錄 (不實際下載，只測試響應)
  console.log('📥 測試 3: 測試下載請假紀錄');
  try {
    const downloadResult = await makeRequest('/api/backup/emergency-download?file=leave-records', true);
    console.log('✅ 下載請求成功 (僅測試響應頭):');
    console.log('Content-Type:', downloadResult.headers['content-type']);
    console.log('Content-Disposition:', downloadResult.headers['content-disposition']);
    console.log('Content-Length:', downloadResult.headers['content-length']);
  } catch (error) {
    console.log('❌ 下載測試失敗:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 4: 測試無效的 User-Agent
  console.log('🚫 測試 4: 測試無效的 User-Agent');
  try {
    const invalidResult = await makeRequest('/api/backup/status', false, 'Invalid-User-Agent');
    console.log('❌ 應該失敗但成功了:', invalidResult);
  } catch (error) {
    if (error.statusCode === 403) {
      console.log('✅ 正確拒絕了無效的 User-Agent');
    } else {
      console.log('❌ 意外的錯誤:', error.message);
    }
  }

  console.log('\n🏁 測試完成！');
}

// HTTP 請求函數
function makeRequest(path, headOnly = false, userAgent = config.userAgent) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: path,
      method: headOnly ? 'HEAD' : 'GET',
      headers: {
        'User-Agent': userAgent
      }
    };

    const client = config.protocol === 'https' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        if (!headOnly) {
          data += chunk;
        }
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (headOnly) {
            resolve({ headers: res.headers, statusCode: res.statusCode });
          } else {
            try {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } catch (e) {
              resolve({ rawData: data, headers: res.headers });
            }
          }
        } else {
          const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
          error.statusCode = res.statusCode;
          error.response = data;
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('請求超時'));
    });

    req.end();
  });
}

// 執行測試
if (require.main === module) {
  testBackupAPI().catch(console.error);
}

module.exports = { testBackupAPI, makeRequest };