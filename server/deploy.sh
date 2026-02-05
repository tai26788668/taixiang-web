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
    echo "🔧 執行 Persistent Disk 初始化..."
    node dist/scripts/init-persistent-disk.js
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Persistent Disk 初始化失敗，嘗試強制初始化..."
        if [ -f "../force-init-disk.js" ]; then
            node ../force-init-disk.js
        else
            echo "⚠️  找不到強制初始化腳本"
        fi
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
