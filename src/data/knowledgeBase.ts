import type { KnowledgeItem } from '@/types';

// 示例景区知识库（Demo数据，可替换为真实景区数据）
export const knowledgeBase: KnowledgeItem[] = [
  {
    id: 'attraction-white-tower',
    category: 'attraction',
    keywords: ['白塔', '塔', 'white tower', 'tower'],
    patterns: [/白塔|塔顶|塔身|塔下/],
    answer: '这座白塔始建于明万历四十七年（1619年），高42.5米，七层八面，是景区最具标志性的古建筑。塔身镶嵌有128尊鎏金佛像，每层檐角悬挂铜铃，清风徐来，铃声悠扬。',
    relatedCard: {
      type: 'image',
      title: '白塔',
      description: '明万历年间古建筑',
    },
    followUp: ['白塔可以登上去吗', '白塔的典故', '白塔的传说'],
  },
  {
    id: 'attraction-spring',
    category: 'attraction',
    keywords: ['泉', '泉水', 'spring', 'water'],
    patterns: [/泉|水|趵突|虎跑/],
    answer: '景区内有三大名泉：趵突泉、虎跑泉、珍珠泉。趵突泉被誉为"天下第一泉"，泉水清澈甘甜，常年恒温18℃。李清照故居就在趵突泉边，泉水滋养了一代词人。',
    followUp: ['泉水可以喝吗', '李清照故居', '其他名泉'],
  },
  {
    id: 'attraction-pavilion',
    category: 'attraction',
    keywords: ['亭', '阁', 'pavilion', 'pavilion'],
    patterns: [/亭|阁|楼|台/],
    answer: '景区内的听雨亭建于清代康熙年间，因亭中听雨意境绝佳而得名。每到雨天，雨打青瓦，滴水成韵，是文人雅士最爱的聚会之所。',
    followUp: ['听雨亭的传说', '亭子历史', '其他古建筑'],
  },
  {
    id: 'service-restroom',
    category: 'service',
    keywords: ['卫生间', '厕所', 'restroom', 'wc', 'toilet', 'bathroom'],
    patterns: [/卫生间|厕所|洗手间|如厕/],
    answer: '前方800米处设有公共卫生间，到站后小雅会提醒您。景区内共设有12处卫生间，均配备无障碍设施。',
    relatedCard: {
      type: 'location',
      title: '最近卫生间',
      description: '前方800米·3分钟步行',
    },
  },
  {
    id: 'service-restaurant',
    category: 'service',
    keywords: ['餐厅', '吃饭', '美食', 'restaurant', 'food', 'eat'],
    patterns: [/餐厅|吃饭|美食|吃什|推荐.*吃/],
    answer: '景区内有3家特色餐厅：湖畔轩（粤菜，人均80元）、山间小厨（本地土菜，人均60元）、听雨茶馆（茶点，人均40元）。如需预订可点击下方按钮。',
    relatedCard: {
      type: 'action',
      title: '查看更多餐厅',
      description: '12家餐厅可供选择',
    },
    followUp: ['推荐本地特色菜', '有素食餐厅吗', '可以订餐吗'],
  },
  {
    id: 'service-shop',
    category: 'service',
    keywords: ['纪念品', '购物', '商店', 'shop', 'souvenir', 'gift'],
    patterns: [/纪念品|购物|商店|买.*东西|特产/],
    answer: '景区文创店位于白塔东侧200米处，主打本地特色文创：白塔造型书签、手绘景区明信片、古风团扇、定制印章等。满200元可包邮到家。',
    followUp: ['文创店在哪', '有什么特色纪念品', '可以邮寄吗'],
  },
  {
    id: 'service-next-stop',
    category: 'service',
    keywords: ['下一站', '下一個', 'next stop', '到哪', 'where'],
    patterns: [/下一站|下站|到哪里|去哪儿/],
    answer: '下一站是"听雨亭"，预计3分钟后到达。沿途您将看到古樟树群和清澈山泉，是拍照打卡的绝佳位置。',
    relatedCard: {
      type: 'location',
      title: '下一站 · 听雨亭',
      description: '预计3分钟到达',
    },
  },
  {
    id: 'service-ticket',
    category: 'service',
    keywords: ['票价', '门票', 'ticket', 'price', '多少钱'],
    patterns: [/票价|门票|多少钱|价格|收费/],
    answer: '景区门票分淡旺季：旺季（4-10月）120元/人，淡季（11-3月）80元/人。身高1.2米以下儿童、65岁以上老人免票。学生证半价。',
    followUp: ['有套票吗', '如何购票', '退票规则'],
  },
  {
    id: 'service-time',
    category: 'service',
    keywords: ['时间', '营业', '几点', 'time', 'hour', 'open'],
    patterns: [/营业时间|几点|开园|闭园|开放/],
    answer: '景区开放时间为：旺季7:00-19:00，淡季7:30-17:30。建议在上午9-10点或下午3-4点入园，避开人流高峰。',
  },
  {
    id: 'service-duration',
    category: 'service',
    keywords: ['多久', '时间', '玩多久', 'duration', 'how long'],
    patterns: [/玩多久|多长时间|逛多久|游览.*时间/],
    answer: '景区全程游览约需3-4小时，主要景点12处。我们的观光车环线全程25分钟，您可以选择在感兴趣的车站下车游览。',
  },
  {
    id: 'weather-today',
    category: 'weather',
    keywords: ['天气', 'weather', '下雨', 'rain', '温度', 'temperature'],
    patterns: [/天气|下雨|温度|多少度/],
    answer: '今日天气晴朗，气温22-28℃，微风轻拂，非常适合游览。紫外线中等，建议涂防晒霜、戴遮阳帽。',
  },
  {
    id: 'weather-tomorrow',
    category: 'weather',
    keywords: ['明天', 'tomorrow', '明天天气'],
    patterns: [/明天.*天气|明日/],
    answer: '明日多云转晴，气温20-26℃，适合户外活动。可能有阵雨，建议携带雨具。',
  },
  {
    id: 'activity-show',
    category: 'activity',
    keywords: ['演出', '表演', 'show', 'performance'],
    patterns: [/演出|表演|节目|什么.*表演/],
    answer: '今日演出安排：上午10:00《古风雅集》（白塔广场）、下午2:00《江南丝竹》（听雨亭）、下午4:00《汉服巡游》（环线）。所有演出免费观看。',
    followUp: ['演出地点', '演出时长', '需要预约吗'],
  },
  {
    id: 'history-culture',
    category: 'history',
    keywords: ['历史', 'history', '由来', '故事', '传说', '典故'],
    patterns: [/历史|由来|故事|传说|典故|文化/],
    answer: '景区始建于南北朝时期，距今已有1500余年历史。这里曾是文人墨客聚集之所，李白、杜甫、苏轼都曾在此留下诗篇。整个景区有72处文物保护单位。',
    followUp: ['李白写过什么诗', '苏轼的典故', '其他历史名人'],
  },
  {
    id: 'chat-greeting',
    category: 'chat',
    keywords: ['你好', 'hello', 'hi', '嗨'],
    patterns: [/^(你好|您好|hello|hi|嗨|哈喽)$/i],
    answer: '您好呀！我是您的专属导游小雅～很高兴为您服务。请问您想去哪里看看呢？',
    followUp: ['介绍一下景区', '推荐必去景点', '今天有什么活动'],
  },
  {
    id: 'chat-thanks',
    category: 'chat',
    keywords: ['谢谢', 'thanks', 'thank you'],
    patterns: [/谢谢|感谢|thank/i],
    answer: '不客气呀！能帮到您是小雅的荣幸～祝您旅途愉快！',
  },
  {
    id: 'chat-name',
    category: 'chat',
    keywords: ['你叫什么', '你的名字', 'who are you', 'name'],
    patterns: [/你叫什么|你.*名字|你是谁/],
    answer: '我是小雅，您的专属智能导游～精通景区历史文化，能说会道，还会拍照呢！有任何问题都可以问我哦～',
  },
];

// 默认快速问题
export const quickQuestions: string[] = [
  '介绍一下白塔',
  '下一站是哪里',
  '附近有什么好吃的',
  '卫生间在哪',
  '今天有什么演出',
  '景区有多大',
];

// 关键词匹配
export function findAnswer(text: string): KnowledgeItem | null {
  const lowerText = text.toLowerCase().trim();

  for (const item of knowledgeBase) {
    // 优先使用正则匹配
    if (item.patterns) {
      for (const pattern of item.patterns) {
        if (pattern.test(lowerText)) {
          return item;
        }
      }
    }
    // 关键词匹配
    for (const keyword of item.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return item;
      }
    }
  }

  return null;
}

// 兜底回答
export function fallbackAnswer(question: string): string {
  return `关于"${question}"这个问题，小雅暂时还不清楚呢～建议您可以咨询景区工作人员，或拨打服务热线 400-888-XXXX 了解详情。`;
}
