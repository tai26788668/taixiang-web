#!/bin/bash

echo "🔨 開始建置..."

# 編譯 TypeScript
echo "📦 編譯 TypeScript..."
tsc

if [ $? -ne 0 ]; then
    echo "❌ TypeScript 編譯失敗"
    exit 1
fi

echo "✅ TypeScript 編譯完成"

# 複製 LINE Bot 檔案
echo "📋 複製 LINE Bot 檔案..."
cp src/line-bot.js dist/line-bot.js

if [ $? -eq 0 ]; then
    echo "✅ LINE Bot 檔案複製完成"
else
    echo "⚠️  LINE Bot 檔案複製失敗，繼續..."
fi

# 複製資料檔案
echo "📋 複製資料檔案..."
if [ -d "data" ]; then
    cp -r data dist/
    echo "✅ 資料檔案複製完成"
else
    echo "⚠️  data 目錄不存在，跳過"
fi

# 複製前端檔案
echo "📋 複製前端檔案..."
if [ -d "../leave_system/dist" ]; then
    mkdir -p dist/leave_system
    cp -r ../leave_system/dist/* dist/leave_system/
    echo "✅ 前端檔案複製完成"
else
    echo "⚠️  前端 dist 目錄不存在，跳過"
fi

echo "🎉 建置完成！"