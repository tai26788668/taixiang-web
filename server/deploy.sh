#!/bin/bash

echo "🚀 泰鄉食品後端部署腳本"
echo "=" | tr '\n' '=' | head -c 60; echo ""

# 步驟 1: 建置前端
echo ""
echo "📦 步驟 1: 建置前端..."
echo "-" | tr '\n' '-' | head -c 60; echo ""

if [ -d "../leave_system" ]; then
    cd ../leave_system
    
    # 安裝前端依賴（總是執行以確保依賴完整）
    echo "📥 安裝前端依賴..."
    npm install --production=false
    if [ $? -ne 0 ]; then
        echo "❌ 前端依賴安裝失敗"
        exit 1
    fi
    
    echo "✅ 前端依賴安裝完成"
    
    # 建置前端
    echo "🔨 建置前端..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ 前端建置失敗"
        exit 1
    fi
    
    echo "✅ 前端建置完成"
    
    # 返回後端目錄
    cd ../server
else
    echo "⚠️  找不到 leave_system 目錄，跳過前端建置"
fi

# 步驟 2: 建置後端
echo ""
echo "📦 步驟 2: 建置後端..."
echo "-" | tr '\n' '-' | head -c 60; echo ""

# 編譯 TypeScript
echo "🔨 編譯 TypeScript..."
tsc

if [ $? -ne 0 ]; then
    echo "❌ TypeScript 編譯失敗"
    exit 1
fi

echo "✅ TypeScript 編譯完成"

# 步驟 3: 複製檔案
echo ""
echo "📦 步驟 3: 複製必要檔案..."
echo "-" | tr '\n' '-' | head -c 60; echo ""

# 複製 LINE Bot 檔案
echo "📋 複製 LINE Bot 檔案..."
if [ -f "src/line-bot.js" ]; then
    cp src/line-bot.js dist/line-bot.js
    echo "✅ LINE Bot 檔案複製完成"
else
    echo "⚠️  LINE Bot 檔案不存在，跳過"
fi

# 複製資料檔案
echo "📋 複製資料檔案..."
if [ -d "data" ]; then
    mkdir -p dist/data
    cp -r data/* dist/data/
    echo "✅ 資料檔案複製完成"
else
    echo "⚠️  data 目錄不存在，跳過"
fi

# 複製前端檔案
echo "📋 複製前端檔案..."
if [ -d "../leave_system/dist" ]; then
    mkdir -p dist/leave_system
    cp -r ../leave_system/dist/* dist/leave_system/
    
    # 驗證複製結果
    if [ -f "dist/leave_system/index.html" ]; then
        echo "✅ 前端檔案複製完成"
        echo "   檔案數量: $(find dist/leave_system -type f | wc -l)"
    else
        echo "❌ 前端檔案複製失敗：找不到 index.html"
        exit 1
    fi
else
    echo "❌ 前端 dist 目錄不存在"
    echo "   請確保前端已成功建置"
    exit 1
fi

# 步驟 4: 初始化 Persistent Disk
echo ""
echo "📦 步驟 4: 初始化 Persistent Disk..."
echo "-" | tr '\n' '-' | head -c 60; echo ""

if [ -n "$PERSISTENT_DISK_PATH" ]; then
    echo "🔧 檢查 Persistent Disk..."
    
    # 檢查 Persistent Disk 是否存在
    if [ ! -d "$PERSISTENT_DISK_PATH" ]; then
        echo "❌ Persistent Disk 不存在: $PERSISTENT_DISK_PATH"
        echo "   請在 Render Dashboard 中創建 Persistent Disk"
    else
        echo "✅ Persistent Disk 已掛載: $PERSISTENT_DISK_PATH"
        
        # 檢查並複製個人資料檔案
        if [ ! -f "$PERSISTENT_DISK_PATH/請假系統個人資料.csv" ]; then
            echo "📋 複製個人資料檔案到 Persistent Disk..."
            if [ -f "dist/data/請假系統個人資料.csv" ]; then
                cp "dist/data/請假系統個人資料.csv" "$PERSISTENT_DISK_PATH/"
                echo "✅ 個人資料檔案複製完成"
            else
                echo "❌ 找不到來源檔案: dist/data/請假系統個人資料.csv"
            fi
        else
            echo "⏭️  個人資料檔案已存在，跳過"
        fi
        
        # 檢查並複製請假記錄檔案
        if [ ! -f "$PERSISTENT_DISK_PATH/請假記錄.csv" ]; then
            echo "📋 複製請假記錄檔案到 Persistent Disk..."
            if [ -f "dist/data/請假記錄.csv" ]; then
                cp "dist/data/請假記錄.csv" "$PERSISTENT_DISK_PATH/"
                echo "✅ 請假記錄檔案複製完成"
            else
                echo "❌ 找不到來源檔案: dist/data/請假記錄.csv"
            fi
        else
            echo "⏭️  請假記錄檔案已存在，跳過"
        fi
        
        # 列出 Persistent Disk 內容
        echo ""
        echo "📁 Persistent Disk 內容:"
        ls -lh "$PERSISTENT_DISK_PATH/" || echo "無法列出目錄內容"
    fi
else
    echo "⏭️  PERSISTENT_DISK_PATH 未設定，跳過初始化"
fi

# 完成
echo ""
echo "=" | tr '\n' '=' | head -c 60; echo ""
echo "🎉 部署建置完成！"
echo "=" | tr '\n' '=' | head -c 60; echo ""
echo ""
echo "📊 建置摘要:"
echo "   後端編譯: ✅"
echo "   前端檔案: $([ -f "dist/leave_system/index.html" ] && echo "✅" || echo "❌")"
echo "   資料檔案: $([ -d "dist/data" ] && echo "✅" || echo "⏭️")"
echo "   LINE Bot: $([ -f "dist/line-bot.js" ] && echo "✅" || echo "⏭️")"
echo ""
