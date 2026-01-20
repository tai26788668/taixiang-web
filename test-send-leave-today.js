/**
 * Test script for /line/send_leave_today endpoint
 * 
 * This script tests the endpoint that sends today's leave notifications
 * to a LINE group.
 * 
 * Usage:
 *   node test-send-leave-today.js [base-url]
 * 
 * Examples:
 *   node test-send-leave-today.js http://localhost:10000
 *   node test-send-leave-today.js https://tai-xiang-backend.onrender.com
 */

const https = require('https');
const http = require('http');

// Get base URL from command line argument or use default
const baseUrl = process.argv[2] || 'http://localhost:10000';
const url = `${baseUrl}/line/send_leave_today`;

console.log('='.repeat(60));
console.log('測試今日請假通知 Endpoint');
console.log('='.repeat(60));
console.log(`目標 URL: ${url}`);
console.log(`測試時間: ${new Date().toISOString()}`);
console.log('='.repeat(60));
console.log('');

// Parse URL to determine protocol
const urlObj = new URL(url);
const client = urlObj.protocol === 'https:' ? https : http;

// Make request
const req = client.get(url, (res) => {
  console.log(`HTTP 狀態碼: ${res.statusCode}`);
  console.log(`回應標頭:`, res.headers);
  console.log('');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('回應內容:');
    console.log('-'.repeat(60));
    
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      console.log('-'.repeat(60));
      console.log('');
      
      if (jsonData.success) {
        console.log('✅ 測試成功！');
        console.log(`   - 找到 ${jsonData.recordCount} 筆今日請假記錄`);
        console.log(`   - 查詢日期: ${jsonData.date}`);
        console.log(`   - 處理時間: ${jsonData.processingTime}`);
      } else {
        console.log('❌ 測試失敗！');
        console.log(`   - 錯誤: ${jsonData.error}`);
        if (jsonData.details) {
          console.log(`   - 詳情: ${jsonData.details}`);
        }
      }
    } catch (e) {
      console.log(data);
      console.log('-'.repeat(60));
      console.log('');
      console.log('⚠️  回應不是 JSON 格式');
    }
    
    console.log('');
    console.log('='.repeat(60));
  });
});

req.on('error', (error) => {
  console.error('❌ 請求失敗:', error.message);
  console.log('');
  console.log('可能的原因:');
  console.log('  1. 伺服器未啟動');
  console.log('  2. URL 錯誤');
  console.log('  3. 網路連線問題');
  console.log('');
  console.log('='.repeat(60));
});

req.end();
