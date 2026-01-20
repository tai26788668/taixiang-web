/**
 * Test script for sendLeaveApplicationNotification function
 * 
 * This script tests the function that sends leave application notifications
 * to a LINE group when a leave application is submitted.
 * 
 * Usage:
 *   node test-leave-application-notification.js
 * 
 * Note: This is a unit test for the function itself.
 * The function will be called from the leave application API in the future.
 */

// Load environment variables
require('dotenv').config({ path: './server/.env' });

// Import the function
const lineBot = require('./server/src/line-bot.js');
const { sendLeaveApplicationNotification } = lineBot;

console.log('='.repeat(60));
console.log('測試請假申請通知函數');
console.log('='.repeat(60));
console.log(`測試時間: ${new Date().toISOString()}`);
console.log('='.repeat(60));
console.log('');

// Test data
const testLeaveData = {
  name: '張三',
  leaveDate: '2026-01-20',
  startTime: '09:00',
  endTime: '17:00',
  leaveType: '事假'
};

console.log('測試資料:');
console.log(JSON.stringify(testLeaveData, null, 2));
console.log('');
console.log('預期訊息格式:');
console.log(`(請假申請)${testLeaveData.name},${testLeaveData.leaveDate} ${testLeaveData.startTime}-${testLeaveData.endTime} ${testLeaveData.leaveType}`);
console.log('');
console.log('-'.repeat(60));
console.log('');

// Check if LINE_GROUP_ID is configured
if (!process.env.LINE_GROUP_ID) {
  console.log('⚠️  警告: LINE_GROUP_ID 未設定');
  console.log('');
  console.log('請在 server/.env 中設定 LINE_GROUP_ID');
  console.log('範例: LINE_GROUP_ID=C1234567890abcdef1234567890abcdef');
  console.log('');
  console.log('如何取得 Group ID:');
  console.log('  1. 將 LINE Bot 加入目標群組');
  console.log('  2. 在群組中發送任意訊息');
  console.log('  3. 查看 webhook 日誌中的 event.source.groupId');
  console.log('');
  console.log('='.repeat(60));
  process.exit(1);
}

console.log('✅ LINE_GROUP_ID 已設定');
console.log('');

// Test the function
console.log('開始測試...');
console.log('');

sendLeaveApplicationNotification(testLeaveData)
  .then((response) => {
    console.log('✅ 測試成功！');
    console.log('');
    console.log('LINE API 回應:');
    console.log(JSON.stringify(response, null, 2));
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('函數測試通過！');
    console.log('此函數已準備好在請假申請 API 中使用。');
    console.log('');
    console.log('='.repeat(60));
  })
  .catch((error) => {
    console.error('❌ 測試失敗！');
    console.error('');
    console.error('錯誤訊息:', error.message);
    console.error('');
    
    if (error.statusCode) {
      console.error(`HTTP 狀態碼: ${error.statusCode}`);
      console.error('');
      
      if (error.statusCode === 400) {
        console.error('可能原因: Group ID 格式錯誤或無效');
      } else if (error.statusCode === 401) {
        console.error('可能原因: Channel Access Token 無效或過期');
      } else if (error.statusCode === 403) {
        console.error('可能原因: Bot 未加入該群組或權限不足');
      }
    }
    
    console.error('');
    console.error('請檢查:');
    console.error('  1. LINE_CHANNEL_ACCESS_TOKEN 是否正確');
    console.error('  2. LINE_CHANNEL_SECRET 是否正確');
    console.error('  3. LINE_GROUP_ID 是否正確');
    console.error('  4. Bot 是否已加入目標群組');
    console.error('');
    console.error('='.repeat(60));
    process.exit(1);
  });
