#!/bin/bash

# 緊急備份下載腳本 (Bash)
# 使用方法: ./emergency-backup.sh <server-url> <action> [output-dir]

# 設定
USER_AGENT="TaiXiang-Emergency-Backup-Tool"
OUTPUT_DIR="${3:-./backup}"
TIMESTAMP=$(date +%Y-%m-%d)

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# 函數：顯示使用方法
show_usage() {
    echo -e "${CYAN}🚨 緊急備份工具${NC}"
    echo ""
    echo "使用方法: $0 <server-url> <action> [output-dir]"
    echo ""
    echo "參數："
    echo "  server-url    伺服器 URL (例如: https://your-server.com)"
    echo "  action        動作類型："
    echo "                  status         - 檢查備份文件狀態"
    echo "                  download-all   - 下載所有備份文件"
    echo "                  download-leave - 下載請假紀錄"
    echo "                  download-personal - 下載個人資料"
    echo "  output-dir    輸出目錄 (預設: ./backup)"
    echo ""
    echo "範例："
    echo "  $0 https://your-server.com status"
    echo "  $0 https://your-server.com download-all"
    echo "  $0 https://your-server.com download-leave ./my-backup"
}

# 函數：發送請求
make_request() {
    local url="$1"
    local output_file="$2"
    
    if [ -n "$output_file" ]; then
        echo -e "${YELLOW}📥 下載: $url -> $output_file${NC}"
        if curl -H "User-Agent: $USER_AGENT" -L -o "$output_file" "$url"; then
            local file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo "unknown")
            echo -e "${GREEN}✅ 下載完成: $output_file ($file_size bytes)${NC}"
        else
            echo -e "${RED}❌ 下載失敗${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}📡 請求: $url${NC}"
        curl -H "User-Agent: $USER_AGENT" -s "$url"
    fi
}

# 檢查參數
if [ $# -lt 2 ]; then
    show_usage
    exit 1
fi

SERVER_URL="$1"
ACTION="$2"

# 驗證動作類型
case "$ACTION" in
    status|download-all|download-leave|download-personal)
        ;;
    *)
        echo -e "${RED}❌ 無效的動作: $ACTION${NC}"
        show_usage
        exit 1
        ;;
esac

# 創建輸出目錄
if [ "$ACTION" != "status" ]; then
    if [ ! -d "$OUTPUT_DIR" ]; then
        mkdir -p "$OUTPUT_DIR"
        echo -e "${GREEN}📁 創建輸出目錄: $OUTPUT_DIR${NC}"
    fi
fi

echo -e "${CYAN}🚨 緊急備份工具啟動${NC}"
echo -e "${CYAN}🌐 伺服器: $SERVER_URL${NC}"
echo -e "${CYAN}🎯 動作: $ACTION${NC}"
echo ""

# 主要邏輯
case "$ACTION" in
    status)
        echo -e "${YELLOW}📋 檢查備份文件狀態...${NC}"
        response=$(make_request "$SERVER_URL/api/backup/status")
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 備份狀態:${NC}"
            echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        else
            echo -e "${RED}❌ 狀態檢查失敗${NC}"
            exit 1
        fi
        ;;
        
    download-all)
        echo -e "${YELLOW}📥 下載所有備份文件...${NC}"
        
        # 下載請假紀錄
        make_request "$SERVER_URL/api/backup/emergency-download?file=leave-records" "$OUTPUT_DIR/leave-records-backup-$TIMESTAMP.csv"
        
        # 下載個人資料
        make_request "$SERVER_URL/api/backup/emergency-download?file=personal-data" "$OUTPUT_DIR/personal-data-backup-$TIMESTAMP.csv"
        
        echo -e "${GREEN}🎉 所有文件下載完成！${NC}"
        ;;
        
    download-leave)
        echo -e "${YELLOW}📥 下載請假紀錄...${NC}"
        make_request "$SERVER_URL/api/backup/emergency-download?file=leave-records" "$OUTPUT_DIR/leave-records-backup-$TIMESTAMP.csv"
        ;;
        
    download-personal)
        echo -e "${YELLOW}📥 下載個人資料...${NC}"
        make_request "$SERVER_URL/api/backup/emergency-download?file=personal-data" "$OUTPUT_DIR/personal-data-backup-$TIMESTAMP.csv"
        ;;
esac

echo ""
echo -e "${GREEN}🏁 操作完成！${NC}"