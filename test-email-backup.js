/**
 * 測試郵件備份功能
 * 
 * 使用方式:
 *   node test-email-backup.js [base-url]
 * 
 * 範例:
 *   node test-email-backup.js http://localhost:10000
 *   node test-email-backup.js https://taixiang.onrender.com
 */

const https = require('https');
const http = require('http');

// 取得 base URL
const baseUrl = process.argv[2] || 'http://localhost:10000';

console.log('='.repeat(60));
console.log('測試郵件備份功能');
console.log('='.repeat(60));
console.log(`目標 URL: ${baseUrl}`);
console.log(`測試時間: ${new Date().toISOString()}`);
console.log('='.repeat(60));
console.log('');

// 測試 1: 驗證 Gmail 設定
console.log('測試 1: 驗證 Gmail 設定');
console.log('-'.repeat(60));

const verifyUrl = `${baseUrl}/api/email/verify-config`;
const urlObj1 = new URL(verifyUrl);
const client1 = urlObj1.protocol === 'https:' ? https : http;

client1.get(verifyUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.configured) {
        console.log('✅ Gmail 設定正確');
        console.log('');
        
        // 測試 2: 發送郵件
        console.log('測試 2: 發送郵件');
        console.log('-'.repeat(60));
        
        const sendUrl = `${baseUrl}/api/email/send-leave-record`;
        const urlObj2 = new URL(sendUrl);
        const client2 = urlObj2.protocol === 'https:' ? https : http;
        
        const options = {
          hostname: urlObj2.hostname,
          port: urlObj2.port,
          path: urlObj2.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        const req = client2.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data);
              console.log(JSON.stringify(jsonData, null, 2));
              
              if (jsonData.success) {
                console.log('✅ 郵件發送成功！');
                console.log(`   收件人: ${jsonData.recipient}`);
                console.log(`   處理時間: ${jsonData.processingTime}`);
                console.log('');
                console.log('請檢查收件匣確認是否收到郵件');
              } else {
                console.log('❌ 郵件發送失敗');
                console.log(`   錯誤: ${jsonData.error}`);
              }
            } catch (e) {
              console.log(data);
              console.log('⚠️  回應不是 JSON 格式');
            }
            
            console.log('');
            console.log('='.repeat(60));
          });
        });
        
        req.on('error', (error) => {
          console.error('❌ 請求失敗:', error.message);
          console.log('');
          console.log('='.repeat(60));
        });
        
        req.end();
        
      } else {
        console.log('❌ Gmail 設定錯誤');
        console.log('');
        console.log('請檢查環境變數:');
        console.log('  - GMAIL_USER');
        console.log('  - GMAIL_APP_PASSWORD');
        console.log('');
        console.log('='.repeat(60));
      }
    } catch (e) {
      console.log(data);
      console.log('⚠️  回應不是 JSON 格式');
      console.log('');
      console.log('='.repeat(60));
    }
  });
}).on('error', (error) => {
  console.error('❌ 請求失敗:', error.message);
  console.log('');
  console.log('可能的原因:');
  console.log('  1. 伺服器未啟動');
  console.log('  2. URL 錯誤');
  console.log('  3. 網路連線問題');
  console.log('');
  console.log('='.repeat(60));
});
