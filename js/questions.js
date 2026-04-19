/**
 * 醒醒鸦 · 测试题目数据 v2.0
 * 4维度20题：A=3分，B=2分，C=1分
 */
var questions = [
    // ========== 电量维度 Q1-Q5 ==========
    { 
        dimension: "电量", 
        text: "周末早上闹钟响了，你的第一反应是？", 
        options: [
            { text: "弹射起床！☀️ 新的一天冲冲冲", score: 3 }, 
            { text: "再躺5分钟...就5分钟 😴", score: 2 }, 
            { text: "闹钟？我早醒了，根本没睡 🌚", score: 1 }
        ] 
    },
    { 
        dimension: "电量", 
        text: "终于完成一件超难的事，你现在的状态是？", 
        options: [
            { text: "我还能再战三百回合！🔥", score: 3 }, 
            { text: "有点累，但成就感满满 ✨", score: 2 }, 
            { text: "我是谁我在哪，脑子已下线 🧠💨", score: 1 }
        ] 
    },
    { 
        dimension: "电量", 
        text: "如果每天多1小时，你会拿来干嘛？", 
        options: [
            { text: "卷死别人 / 做想做的事 💪", score: 3 }, 
            { text: "补觉 or 吃顿好的 🍜", score: 2 }, 
            { text: "躺着发呆，时间对我没意义 🫠", score: 1 }
        ] 
    },
    { 
        dimension: "电量", 
        text: "你现在对咖啡/续命水的依赖程度？", 
        options: [
            { text: "不需要，本人体质特殊 ⚡", score: 3 }, 
            { text: "偶尔来一杯，但不硬依赖 ☕", score: 2 }, 
            { text: "喝了也没用，人已经麻了 💀", score: 1 }
        ] 
    },
    { 
        dimension: "电量", 
        text: "回想过去一个月，「感觉自己超能打」的天数有？", 
        options: [
            { text: "超过15天，状态一直在线 💯", score: 3 }, 
            { text: "7-15天，起起伏伏还凑合 📊", score: 2 }, 
            { text: "不到7天，每天都在渡劫 🚶💨", score: 1 }
        ] 
    },
    
    // ========== 情绪维度 Q6-Q10 ==========
    { 
        dimension: "情绪", 
        text: "最近三天情绪最上头的一次是因为？", 
        options: [
            { text: "好事！升职/加薪/脱单/抽到SSR 🎉", score: 3 }, 
            { text: "小事，能消化那种 😑", score: 2 }, 
            { text: "没什么大事，就是莫名烦躁 😤", score: 1 }
        ] 
    },
    { 
        dimension: "情绪", 
        text: "有人问你「最近咋样」，你会？", 
        options: [
            { text: "真诚笑：挺好的呀！😊", score: 3 }, 
            { text: "敷衍笑：还行吧... 😶", score: 2 }, 
            { text: "心里累但表面演：哈哈挺好的 😮‍💨", score: 1 }
        ] 
    },
    { 
        dimension: "情绪", 
        text: "你上一次觉得「生活真有意思」是？", 
        options: [
            { text: "今天/昨天！开心着呢 😄", score: 3 }, 
            { text: "这周内，还不错 👍", score: 2 }, 
            { text: "好久没这种感觉了... 🤔", score: 1 }
        ] 
    },
    { 
        dimension: "情绪", 
        text: "遇到糟心事，你的心理活动是？", 
        options: [
            { text: "问题不大，我能搞定 😎", score: 3 }, 
            { text: "烦一会儿，但能自己消化 🫤", score: 2 }, 
            { text: "一件小事能让我郁闷一整天 😢", score: 1 }
        ] 
    },
    { 
        dimension: "情绪", 
        text: "你现在对「明天」的期待程度？", 
        options: [
            { text: "有点东西！期待拉满 🌟", score: 3 }, 
            { text: "又是普通一天，无所谓 😐", score: 2 }, 
            { text: "不想面对，希望时间快进 ⏰😩", score: 1 }
        ] 
    },
    
    // ========== 行动维度 Q11-Q15 ==========
    { 
        dimension: "行动", 
        text: "手头有件重要的事，你通常？", 
        options: [
            { text: "说干就干，冲了再说 🚀", score: 3 }, 
            { text: "规划一下，然后慢慢搞 📝", score: 2 }, 
            { text: "拖到最后一刻，deadline战神 ⏰😱", score: 1 }
        ] 
    },
    { 
        dimension: "行动", 
        text: "这周的 to-do list 完成得咋样？", 
        options: [
            { text: "大部分搞定，效率王者 👑", score: 3 }, 
            { text: "完成一半吧，勉强及格 📝", score: 2 }, 
            { text: "什么list？脑子一团浆糊 🧠💫", score: 1 }
        ] 
    },
    { 
        dimension: "行动", 
        text: "突然有个超棒的想法，你会？", 
        options: [
            { text: "马上开干！冲鸭！🦆", score: 3 }, 
            { text: "先记下来，有空再说 📝", score: 2 }, 
            { text: "想了一下，然后...没有然后了 💭➡️❌", score: 1 }
        ] 
    },
    { 
        dimension: "行动", 
        text: "你最近一次「说走就走」的行动是？", 
        options: [
            { text: "这周！想做什么就做什么 🏃", score: 3 }, 
            { text: "上个月吧，偶尔冲动一下 📅", score: 2 }, 
            { text: "记忆里没有这回事 🙈", score: 1 }
        ] 
    },
    { 
        dimension: "行动", 
        text: "现在你的状态更像哪种动物？", 
        options: [
            { text: "永动机兔兔，停不下来 🐰💨", score: 3 }, 
            { text: "随性猫猫，想动就动 🐱", score: 2 }, 
            { text: "摆烂树懒，不想动弹 🦥", score: 1 }
        ] 
    },
    
    // ========== 连接维度 Q16-Q20 ==========
    { 
        dimension: "连接", 
        text: "朋友群有人发消息，你通常？", 
        options: [
            { text: "秒回！气氛组担当 💬", score: 3 }, 
            { text: "看心情，偶尔冒泡 👀", score: 2 }, 
            { text: "已读不回，社恐发作中 😅", score: 1 }
        ] 
    },
    { 
        dimension: "连接", 
        text: "最近有人主动来找你玩吗？", 
        options: [
            { text: "有！朋友很多的 😊", score: 3 }, 
            { text: "偶尔有人想起我 🤏", score: 2 }, 
            { text: "没有，我已经透明了 👻", score: 1 }
        ] 
    },
    { 
        dimension: "连接", 
        text: "你上一次和人深度聊天是？", 
        options: [
            { text: "今天/昨天！聊得很嗨 😄", score: 3 }, 
            { text: "这周内，聊过一两次 💭", score: 2 }, 
            { text: "记不清了，好久没聊透 🔇", score: 1 }
        ] 
    },
    { 
        dimension: "连接", 
        text: "你身边有可以说心里话的「重要的人」吗？", 
        options: [
            { text: "有好几个！被爱包围 💕", score: 3 }, 
            { text: "有一两个知心的 👫", score: 2 }, 
            { text: "好像没有...说不出口 😔", score: 1 }
        ] 
    },
    { 
        dimension: "连接", 
        text: "心情不好的时候，你会？", 
        options: [
            { text: "找信任的人倾诉 💬", score: 3 }, 
            { text: "发条动态暗示一下 📱", score: 2 }, 
            { text: "自己消化，不想麻烦别人 😶‍🌫️", score: 1 }
        ] 
    }
];
