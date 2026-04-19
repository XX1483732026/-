/**
 * 醒醒鸦 · 测试题目数据
 * 当前为旧版题目（等第一步确认后更新为新版4维度20题）
 */
var questions = [
    { text: "闹钟响了，你的第一反应是？", options: [{ text: "立刻起床，迎接新的一天 ✨", score: 3 }, { text: "再躺5分钟...就5分钟... 😴", score: 2 }, { text: "闹钟？我早就醒了，根本没睡 🌚", score: 1 }] },
    { text: "周末有人约你出门，你的内心活动是？", options: [{ text: "好耶！出门透透气！🎉", score: 3 }, { text: "看情况吧，心情好再去 🤔", score: 2 }, { text: "别吧...让我再躺会儿...🛋️", score: 1 }] },
    { text: "你的手机屏幕使用时间大概是？", options: [{ text: "4小时以内，我很克制 📱", score: 3 }, { text: "4-8小时，正常水平吧 😐", score: 2 }, { text: "不敢看，看了会焦虑 💀", score: 1 }] },
    { text: "最近一次感到「活着真好」是什么时候？", options: [{ text: "今天/最近几天 ☀️", score: 3 }, { text: "好像...有一阵子了 🌥️", score: 2 }, { text: "想不起来了 🌫️", score: 1 }] },
    { text: "如果可以用一个词形容你现在的状态？", options: [{ text: "活力满满 🔋", score: 3 }, { text: "还能撑 💪", score: 2 }, { text: "行尸走肉 🧟", score: 1 }] },
    { text: "朋友群里有人发消息，你通常会？", options: [{ text: "积极回复，气氛担当 💬", score: 3 }, { text: "看心情，偶尔回一下 👀", score: 2 }, { text: "已读不回是常态 🔇", score: 1 }] },
    { text: "有人请你帮忙做一件麻烦的事，你会？", options: [{ text: "能帮就帮，朋友嘛 🤝", score: 3 }, { text: "先评估一下值不值得 🧮", score: 2 }, { text: "表面答应，内心崩溃 😱", score: 1 }] },
    { text: "你觉得自己在朋友眼中是？", options: [{ text: "靠谱的、能扛事的 💪", score: 3 }, { text: "存在感不太强的 👻", score: 2 }, { text: "那个「下次一定」的人 🙃", score: 1 }] },
    { text: "最近一次主动联系朋友是什么时候？", options: [{ text: "这几天刚聊过 📞", score: 3 }, { text: "一两周前吧 📅", score: 2 }, { text: "让我想想...好像很久了 📆", score: 1 }] },
    { text: "有人问「最近怎么样」，你的真实回答是？", options: [{ text: "挺好的呀！😊", score: 3 }, { text: "就那样吧，还能过 😐", score: 2 }, { text: "哈哈（没有然后了）😅", score: 1 }] },
    { text: "周日晚上，想到明天要上班/上学，你的心情是？", options: [{ text: "期待新的一周！🌟", score: 3 }, { text: "正常，习惯了 📋", score: 2 }, { text: "开始胃痛/焦虑/想辞职退学 😣", score: 1 }] },
    { text: "面对一项艰巨的任务，你的态度是？", options: [{ text: "干就完了！冲！🚀", score: 3 }, { text: "先做计划，慢慢推进 📝", score: 2 }, { text: "拖到最后一刻再疯狂赶工 ⏰", score: 1 }] },
    { text: "你对目前的工作/学业的感受是？", options: [{ text: "有意义，在往目标前进 🎯", score: 3 }, { text: "还行，凑合着干吧 🤷", score: 2 }, { text: "每天都在怀疑人生 🌀", score: 1 }] },
    { text: "你的待办事项列表通常是？", options: [{ text: "有条理，按计划执行 ✅", score: 3 }, { text: "有是有，但不一定照做 📋", score: 2 }, { text: "什么待办？全在脑子里乱成一团 🧠", score: 1 }] },
    { text: "如果中了彩票不用工作了，你还会继续现在的工作吗？", options: [{ text: "会，我挺喜欢的 💼", score: 3 }, { text: "可能会换个方向 🔄", score: 2 }, { text: "跑！连夜跑！🏃💨", score: 1 }] },
    { text: "独处的时候，你通常会？", options: [{ text: "做自己喜欢的事，很充实 🎨", score: 3 }, { text: "刷刷手机，打发时间 📱", score: 2 }, { text: "焦虑、胡思乱想、不知干啥 😰", score: 1 }] },
    { text: "你觉得自己是一个怎样的人？", options: [{ text: "有目标、有行动力的人 🔥", score: 3 }, { text: "普通人，不功不过 🌿", score: 2 }, { text: "说不清楚，挺迷茫的 🌫️", score: 1 }] },
    { text: "如果生活是一部剧，你觉得你是？", options: [{ text: "主角，剧情由我书写 🎬", score: 3 }, { text: "配角，但有自己的高光时刻 🎭", score: 2 }, { text: "路人甲，背景板 🎪", score: 1 }] },
    { text: "你最近经常出现的情绪是？", options: [{ text: "平静、满足、开心 😌", score: 3 }, { text: "焦虑、疲惫、无聊 😫", score: 2 }, { text: "麻木、虚无、无所谓 😶", score: 1 }] },
    { text: "如果要对现在的自己说一句话，你会说？", options: [{ text: "继续加油，你挺棒的！💪", score: 3 }, { text: "还可以再努力一点点 📈", score: 2 }, { text: "醒醒啊！！！🚨", score: 1 }] }
];
