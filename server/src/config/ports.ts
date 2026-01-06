/**
 * 🔒 Port 配置常量
 * 
 * 此文件定義了專案的固定 Port 設定
 * ⚠️ 警告: 不要修改這些值！
 * 
 * 如果需要變更 Port，請先與團隊討論並更新所有相關文件
 */

export const PORT_CONFIG = {
  /**
   * 開發環境 Port
   * 用於本地開發和測試
   */
  DEVELOPMENT: 80,

  /**
   * 生產環境 Port
   * 用於正式部署
   * 注意: Port 80 需要管理員權限
   */
  PRODUCTION: 80,
} as const;

/**
 * 獲取當前環境應使用的 Port
 */
export function getPort(): number {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? PORT_CONFIG.PRODUCTION : PORT_CONFIG.DEVELOPMENT;
}

/**
 * 驗證 Port 設定
 * 如果環境變數中的 PORT 與預期不符，發出警告
 */
export function validatePort(): void {
  const expectedPort = getPort();
  const envPort = process.env.PORT ? parseInt(process.env.PORT) : null;
  
  if (envPort && envPort !== expectedPort) {
    console.warn('⚠️  警告: Port 設定不一致');
    console.warn(`   環境變數 PORT: ${envPort}`);
    console.warn(`   預期 PORT: ${expectedPort}`);
    console.warn(`   🔒 將使用固定 Port: ${expectedPort}`);
  }
}

/**
 * 獲取環境名稱
 */
export function getEnvironmentName(): string {
  return process.env.NODE_ENV === 'production' ? '生產環境' : '開發環境';
}
