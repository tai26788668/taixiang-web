/**
 * 強制所有時間輸入使用24小時制的工具函數
 */

/**
 * 初始化24小時制時間輸入
 * 這個函數會在應用啟動時調用，確保所有時間輸入都使用24小時制
 */
export function initialize24HourTimeInputs() {
  // 設置全域樣式來隱藏AM/PM
  const style = document.createElement('style');
  style.textContent = `
    input[type="time"]::-webkit-datetime-edit-ampm-field,
    input[type="time"]::-webkit-datetime-edit-meridiem-field {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    input[type="time"] {
      -webkit-appearance: textfield;
      -moz-appearance: textfield;
    }
  `;
  document.head.appendChild(style);

  // 監聽所有時間輸入的創建
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // 處理新添加的時間輸入
          const timeInputs = element.querySelectorAll('input[type="time"]');
          timeInputs.forEach(setupTimeInput);
          
          // 如果節點本身是時間輸入
          if (element.matches && element.matches('input[type="time"]')) {
            setupTimeInput(element as HTMLInputElement);
          }
        }
      });
    });
  });

  // 開始觀察DOM變化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 處理已存在的時間輸入
  document.querySelectorAll('input[type="time"]').forEach(setupTimeInput);
}

/**
 * 設置單個時間輸入元素為24小時制
 */
function setupTimeInput(input: Element) {
  const timeInput = input as HTMLInputElement;
  
  // 設置屬性強制24小時制
  timeInput.setAttribute('step', '60');
  timeInput.setAttribute('pattern', '[0-9]{2}:[0-9]{2}');
  
  // 添加事件監聽器
  const handleFocus = () => {
    // 強制24小時制樣式
    timeInput.style.setProperty('-webkit-appearance', 'textfield');
    timeInput.style.setProperty('-moz-appearance', 'textfield');
  };

  const handleInput = () => {
    const value = timeInput.value;
    
    // 驗證並修正24小時制格式
    if (value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      const parts = value.split(':');
      if (parts.length === 2) {
        let hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        
        // 確保小時在0-23範圍內
        if (hours > 23) {
          hours = hours % 24;
        }
        
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          const formattedValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          timeInput.value = formattedValue;
          
          // 觸發change事件
          timeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  };

  // 移除舊的事件監聽器（如果存在）
  timeInput.removeEventListener('focus', handleFocus);
  timeInput.removeEventListener('input', handleInput);
  
  // 添加新的事件監聽器
  timeInput.addEventListener('focus', handleFocus);
  timeInput.addEventListener('input', handleInput);
  
  // 立即應用樣式
  handleFocus();
}

/**
 * 驗證時間格式是否為24小時制
 */
export function isValid24HourTime(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

/**
 * 格式化時間為24小時制
 */
export function format24HourTime(hours: number, minutes: number): string {
  const h = Math.max(0, Math.min(23, hours));
  const m = Math.max(0, Math.min(59, minutes));
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}