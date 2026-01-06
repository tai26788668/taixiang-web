export interface ImageTextCardData {
  id: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  order: number
}

export interface WebsiteConfig {
  site: {
    name: string
    description: string
    keywords: string[]
    author: string
    url: string
  }
  
  hero: {
    title: string
    subtitle: string
    ctaText: string
    backgroundImage?: string
  }
  
  products: {
    title: string
    subtitle: string
    items: Array<{
      id: string
      title: string
      description: string
      icon: string
      category: 'traditional' | 'modern'
      image?: string
    }>
  }

  productsFlavors: {
    title: string
    subtitle: string
    items: Array<{
      id: string
      title: string
      description: string
      icon: string
      category: string // 對應產品類別的 title
      color: string
      package: string
    }>
  }
  
  about: {
    title: string
    subtitle: string
    description: string[]
    stats: Array<{
      value: string
      label: string
    }>
    features: Array<{
      icon: string
      title: string
      description: string
      gradient: string
    }>
  }
  
  aboutDetail: {
    title: string
    subtitle: string
    cards: ImageTextCardData[]
  }
  
  contact: {
    title: string
    subtitle: string
    info: {
      phone: string
      email: string
      address: string
    }
    hours: {
      weekdays: string
      saturday: string
      sunday: string
    }
  }
  
  footer: {
    description: string
    links: Array<{
      title: string
      items: Array<{
        label: string
        href: string
        external?: boolean
      }>
    }>
  }

  // 方案 A 專用配置
  deployment?: {
    plan: 'A' | 'B'
    backendUrl: string
  }
}

export const websiteConfig: WebsiteConfig = {
  site: {
    name: '泰鄉食品',
    description: '泰鄉食品專注於傳統餅乾製作，提供麻粩、寸棗、蘇打餅乾等優質產品。堅持使用天然食材，傳承三十年製餅工藝。',
    keywords: ['泰鄉食品', '餅乾', '麻粩', '寸棗', '蘇打餅乾', '傳統製餅', '天然食材', '台灣餅乾', '節慶伴手禮'],
    author: '泰鄉食品',
    url: 'https://taixiang-foods.com'
  },
  
  hero: {
    title: '歡迎來到泰鄉餅乾的世界',
    subtitle: '天然食材，美味無限',
    ctaText: '了解更多'
  },
  
  products: {
    title: '產品類別',
    subtitle: '傳承五十年的製餅工藝，每一口都是用心的味道',
    items: [
      {
        id: 'product-1',
        title: '麻粩',
        description: '拜麻粩會吃到老老老（長壽之意），粩也是結婚、新娘歸寧常用的伴手禮，取其「白頭偕老」的寓意。採用傳統手工製作工藝，選用優質糯米粉與花生，經過反覆揉製、成型、油炸等繁複工序，創造出外酥內軟、香甜可口的經典口感，是台灣傳統節慶不可缺少的美味。',
        icon: '🥠',
        category: 'traditional'
      },
      {
        id: 'product-2',
        title: '寸棗',
        description: '寓意「年年好」，在傳統節慶中代表吉祥與好運。精選優質麵粉與麥芽糖，透過古法製作技藝，將麵團搓揉成細長條狀後油炸至金黃，外層裹上香甜糖漿，形成獨特的酥脆口感。每一口都散發著濃郁的麥香與甜蜜滋味，承載著對未來美好生活的祝福與期盼。',
        icon: '🍯',
        category: 'traditional'
      },
      {
        id: 'product-3',
        title: '蘇打餅乾',
        description: '最簡單的滋味，擁有最不同的風味。採用天然酵母發酵技術，嚴選優質小麥粉，不添加人工防腐劑，經過精密的溫度控制烘焙而成。口感清爽酥脆，淡淡的鹹香中帶有微妙的甜味，既可單獨享用，也是搭配各種食材的完美基底，展現簡約中的不凡品味。',
        icon: '🍪',
        category: 'modern'
      },
      {
        id: 'product-4',
        title: '蘇打夾心',
        description: '除了配牛軋，蘇打餅總是擁有一份驚奇。以經典蘇打餅乾為基底，創新加入多種夾心口味選擇，從傳統的花生醬、巧克力，到現代的蔓越莓、起司等豐富變化。每一層都經過精心調配，讓簡單的餅乾變身為層次豐富的美味點心，滿足現代人對創新口感的追求。',
        icon: '🥪',
        category: 'modern'
      }
    ]
  },

  productsFlavors: {
    title: '產品口味',
    subtitle: '多樣化的口味選擇，滿足每一位顧客的味蕾需求',
    items: [
      // 麻粩類別的口味
      {
        id: 'flavor-1-1',
        title: '芝麻麻粩',
        description: '選用優質黑芝麻，經過傳統手工炒製工藝，散發濃郁芝麻香氣。外層酥脆內層軟糯，每一口都能品嚐到芝麻的天然甘甜。富含維生素E和不飽和脂肪酸，是健康美味的傳統點心。',
        icon: '/images/flavors/category1_sesame.jpg',
        category: '麻粩',
        color: '#8B4513',
        package: '5斤袋裝'
      },
      {
        id: 'flavor-1-2', 
        title: '花生麻粩',
        description: '嚴選台灣在地花生，經過低溫烘焙保留完整營養價值。花生香氣濃郁回甘，搭配糯米的Q彈口感，層次豐富令人回味無窮。每顆花生都飽滿香甜，是老少皆宜的經典美味。',
        icon: '/images/flavors/category1_peanut.jpg',
        category: '麻粩',
        color: '#D2691E',
        package: '5斤袋裝'
      },
      {
        id: 'flavor-1-3',
        title: '米香麻粩',
        description: '採用優質蓬萊米製作，保留米粒的天然清香與甘甜。口感清淡不膩，帶有淡雅的米香味，適合喜愛清爽口味的消費者。傳統製作工藝結合現代衛生標準，呈現最純粹的米香風味。',
        icon: '/images/flavors/category1_rice.jpg',
        category: '麻粩', 
        color: '#654321',
        package: '5斤袋裝'
      },
      // 寸棗類別的口味
      {
        id: 'flavor-2-1',
        title: '傳統寸棗',
        description: '承襲古法製作技藝，選用優質麵粉與麥芽糖精心調製。外層金黃酥脆，內層香甜軟糯，甜度適中不膩口。寓意「年年好」的吉祥點心，是節慶送禮的最佳選擇。',
        icon: '/images/flavors/category2_1.jpg',
        category: '寸棗',
        color: '#DAA520',
        package: '10斤袋裝'
      },
      // 蘇打餅乾類別的口味
      {
        id: 'flavor-3-1',
        title: '芝麻蘇打餅',
        description: '精選優質芝麻烘焙，散發天然香氣，讓每一片餅乾都充滿迷人風味。蘇打餅特有的輕盈口感，搭配芝麻的醇厚滋味，鹹香適中不膩口。無論是搭配茶飲、咖啡，或當作日常點心，都能帶來滿足的味蕾享受。簡單純粹的美味，讓生活多一份樸實的幸福感。',
        icon: '/images/flavors/category3_sesame.jpg',
        category: '蘇打餅乾',
        color: '#87CEEB',
        package: '3片-約17g/包;5斤/袋'
      },
      {
        id: 'flavor-3-2',
        title: '青蔥蘇打餅',
        description: '新鮮青蔥經過特殊處理保留完整香氣，與蘇打餅完美結合。每一口都能品嚐到青蔥的清香與蘇打餅的酥脆，鹹香適中不搶奪主味。適合搭配茶飲或咖啡享用，是下午茶時光的絕佳選擇。',
        icon: '/images/flavors/category3_scallion.jpg',
        category: '蘇打餅乾',
        color: '#2E8B57',
        package: '3片-約17g/包;5斤/袋'
      },
      {
        id: 'flavor-3-3',
        title: '胡椒蘇打餅',
        description: '精選優質黑胡椒粉調味，帶來微辣的刺激口感與獨特香氣。胡椒的辛香與蘇打餅的清淡形成完美平衡，微辣開胃不刺激。適合喜愛重口味的消費者，也是搭配湯品的理想選擇。',
        icon: '/images/flavors/category3_pepper.jpg',
        category: '蘇打餅乾',
        color: '#8B4513',
        package: '3片-約17g/包;5斤/袋'
      },
      {
        id: 'flavor-3-4',
        title: '紫菜蘇打餅',
        description: '嚴選海洋紫菜，將大海的鮮美濃縮在每一片餅乾中。酥脆輕盈的蘇打餅體，與紫菜的鮮香完美融合，鹹鮮適口回味無窮。適合搭配湯品、飲品，或單獨享用都別有風味。來自海洋的純淨美味，讓您的味蕾展開一場清新之旅。',
        icon: '/images/flavors/category3_vege.jpg',
        category: '蘇打餅乾',
        color: '#8B4513',
        package: '3片-約17g/包;5斤/袋'
      },
      // 蘇打夾心類別的口味
      {
        id: 'flavor-4-1',
        title: '青蔥蘇打夾心',
        description: '新鮮青蔥融入綿密內餡，每一口都是濃郁的蔥香驚喜。雙層蘇打餅皮酥脆爽口，夾心柔滑細緻，鹹香交織層次豐富。辦公室下午茶、追劇良伴，或是朋友聚會分享都適合。',
        icon: '/images/flavors/category4_1.jpg',
        category: '蘇打夾心',
        color: '#FFD700',
        package: '1份-約21g/包;5斤/袋'
      }
    ]
  },
  
  about: {
    title: '關於我們',
    subtitle: '健康美味，專業生產',
    description: [
      '泰鄉食品擁有五十年專業製餅經驗，從手工到現代化生產，我們不僅有自有品牌產品，更是眾多知名品牌的信賴代工夥伴。',
      '從傳統節慶餅乾到健康取向蘇打餅，滿足不同消費者的需求。'
    ],
    stats: [
      { value: '50+', label: '年製餅經驗' },
      { value: '30+', label: '家合作品牌' },
      { value: '1000+', label: '個客戶滿意' }
    ],
    features: [
      {
        icon: '🏭',
        title: '我們的服務',
        description: '專業代工 / 自有品牌雙軌經營',
        gradient: 'from-blue-50 to-indigo-50'
      },
      {
        icon: '🛒',
        title: '哪裡吃得到',
        description: '不一定只有我們的自有品牌，在這裡您都嚐過: 台灣最大連鎖店 / 台灣最大美式賣場 / 甜點品牌 / 飛機餐 / 鄉間通路',
        gradient: 'from-green-50 to-emerald-50'
      }
    ]
  },
  
  aboutDetail: {
    title: '深入了解泰鄉',
    subtitle: '從傳統工藝到現代創新，五十年來堅持品質的製餅之路',
    cards: [
      {
        id: 'heritage',
        title: '傳統工藝的堅持',
        description: '北部知名的麻粩、寸棗專業製造商，我們傳承五十年的純手工製作技藝。每一道製程都保留著古老的技術精髓，從選料、調配到成型，無不體現著老師傅的匠心獨運。麻粩象徵「白頭偕老」的美好寓意，寸棗寓意「年年好」的吉祥祝福，這些不僅是食品，更是承載著台灣文化記憶的珍貴傳承。',
        imageSrc: '/images/history_4.jpg',
        imageAlt: '傳統手工製作麻粩和寸棗的工藝過程',
        order: 1
      },
      {
        id: 'modern-innovation',
        title: '現代健康新選擇',
        description: '順應時代潮流，我們開發出健康導向的蘇打餅乾系列產品。採用優質原料，不添加防腐劑，以現代化的生產設備結合傳統製餅智慧，創造出口感酥脆、營養均衡的現代餅乾。從最簡單的原味蘇打餅，到創新的夾心系列，每一款都經過精心調配，滿足現代消費者對健康美味的雙重需求。',
        imageSrc: '/images/history_2.jpg',
        imageAlt: '現代化生產線製作健康蘇打餅乾',
        order: 2
      },
      {
        id: 'custom-service',
        title: '客製化創新服務',
        description: '作為專業的OEM/ODM製造商，我們提供全方位的客製化服務。從冰淇淋夾心、牛軋餅夾心到蔓越莓軟糖夾心，任何創意構想都能透過我們多樣化的餅乾基底來實現。五十年的製餅經驗讓我們成為眾多知名品牌的信賴夥伴，產品遍布台灣各大通路，從連鎖超商到精品甜點店都能見到我們的產品。',
        imageSrc: '/images/history_5.jpg',
        imageAlt: '多樣化的客製化餅乾產品展示',
        order: 3
      }
    ]
  },
  
  contact: {
    title: '聯絡我們',
    subtitle: '有任何問題或需求嗎？歡迎與我們聯繫',
    info: {
      phone: '02-2678-8668',
      email: 'tai26788668@gmail.com',
      address: '239新北市鶯歌區德昌二街82號'
    },
    hours: {
      weekdays: '週一至週五 8:30 - 17:00',
      saturday: '週六 休息',
      sunday: '週日 休息'
    }
  },
  
  footer: {
    description: '專注於傳統餅乾製作，堅持使用天然食材，為客戶提供最美味、最健康的餅乾產品。',
    links: [
      {
        title: '快速連結',
        items: [
          { label: '首頁', href: '#home' },
          { label: '關於我們', href: '#about' },
          { label: '產品', href: '#products' },
          { label: '線上產品', href: '#online-products' },
          { label: '聯絡我們', href: '#contact' },
          { label: '員工專區', href: 'https://tai-xiang-backend.onrender.com/leave_system', external: true }
        ]
      }
    ]
  },

  // 方案 A 專用配置
  deployment: {
    plan: 'A',
    backendUrl: 'https://tai-xiang-backend.onrender.com'
  }
}