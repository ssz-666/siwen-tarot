(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const storage = {
    apiKey: "siwen.deepseek.apiKey",
    model: "siwen.deepseek.model",
    base: "siwen.deepseek.base",
    daily: "siwen.tarot.daily"
  };

  const majorFiles = [
    "00_Fool.jpg", "01_Magician.jpg", "02_High_Priestess.jpg", "03_Empress.jpg", "04_Emperor.jpg",
    "05_Hierophant.jpg", "06_Lovers.jpg", "07_Chariot.jpg", "08_Strength.jpg", "09_Hermit.jpg",
    "10_Wheel_of_Fortune.jpg", "11_Justice.jpg", "12_Hanged_Man.jpg", "13_Death.jpg", "14_Temperance.jpg",
    "15_Devil.jpg", "16_Tower.jpg", "17_Star.jpg", "18_Moon.jpg", "19_Sun.jpg", "20_Judgement.jpg", "21_World.jpg"
  ];

  const majorCards = [
    ["愚者", "信任未知", "新的门已经打开，答案不在计划里，而在第一步里。"],
    ["魔术师", "显化与行动", "资源已经在手边，关键是把意图变成动作。"],
    ["女祭司", "直觉与隐秘", "别急着求证，安静处藏着更准确的线索。"],
    ["皇后", "滋养与丰盛", "温柔不是停滞，而是让事物自然长成。"],
    ["皇帝", "秩序与边界", "建立规则，答案会从清晰的边界中出现。"],
    ["教皇", "传统与学习", "向成熟体系借力，也听见内在真正相信的声音。"],
    ["恋人", "选择与关系", "这不是单纯的取舍，而是价值观的校准。"],
    ["战车", "意志与推进", "方向一旦确定，就让分散的力量回到同一条路上。"],
    ["力量", "温柔的勇气", "真正的掌控来自耐心，而不是压制。"],
    ["隐士", "独处与洞见", "暂时退后一步，才能看见真正重要的光。"],
    ["命运之轮", "转折与时机", "变化已经开始，顺势比硬扛更有效。"],
    ["正义", "因果与判断", "诚实面对事实，才会得到公平的答案。"],
    ["倒吊人", "暂停与换位", "停下来不是失败，是换一个角度看见路。"],
    ["死神", "结束与重生", "旧结构正在脱落，为新阶段腾出空间。"],
    ["节制", "调和与修复", "慢一点，比例对了，事情会重新流动。"],
    ["恶魔", "欲望与束缚", "看见执念，才有机会把自己领回来。"],
    ["高塔", "瓦解与真相", "不稳的东西被拆掉，是为了让真实站住。"],
    ["星星", "希望与疗愈", "别低估微弱的光，它正在带你回到未来。"],
    ["月亮", "迷雾与潜意识", "焦虑不等于预言，先辨认恐惧的形状。"],
    ["太阳", "清晰与生命力", "答案正在变亮，允许自己坦然地拥有。"],
    ["审判", "召唤与觉醒", "过去的经验正在呼唤你做一个更大的决定。"],
    ["世界", "完成与整合", "这一轮经验正在合拢，带着成果进入下个循环。"]
  ];

  const suitConfigs = [
    ["权杖", "Wands", "火元素", "行动、热情、创造力与事业推进"],
    ["圣杯", "Cups", "水元素", "感情、关系、直觉与内在需求"],
    ["宝剑", "Swords", "风元素", "思考、沟通、冲突与决断"],
    ["星币", "Pents", "土元素", "金钱、身体、工作与现实基础"]
  ];
  const rankNames = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "侍从", "骑士", "王后", "国王"];
  const rankKeywords = ["起始", "选择", "成长", "稳定", "挑战", "调整", "考验", "行动", "收获", "完成", "学习", "推进", "成熟", "掌控"];

  const spreads = [
    spread("single", "单张指引", "适合快速获得一句核心提醒。", ["此刻最重要的指引"]),
    spread("three", "三牌阵", "适合时间线、现状分析和一般问题。", ["过去", "现在", "未来"]),
    spread("choice", "二择一牌阵", "适合选择、取舍与路径比较。", ["你真正想要的", "选项 A 的趋势", "选项 B 的趋势", "隐藏影响", "建议"]),
    spread("career", "事业推进牌阵", "适合工作、机会、晋升和项目判断。", ["当前局势", "优势资源", "阻碍", "下一步行动", "三个月趋势"]),
    spread("relationship", "关系解析", "适合亲密关系、合作关系和暧昧关系。", ["你的状态", "对方状态", "关系核心", "阻碍", "建议", "未来趋势"]),
    spread("money", "财富流向牌阵", "适合收入、支出、投资和现实资源。", ["财富现状", "增长机会", "消耗点", "潜在风险", "可执行策略"]),
    spread("yesno", "是否牌阵", "适合判断可行性，但会给出条件而非绝对答案。", ["支持因素", "反对因素", "关键变量", "倾向答案"]),
    spread("horseshoe", "马蹄牌阵", "适合看清事件来龙去脉。", ["过去影响", "现在状态", "隐藏因素", "外部环境", "阻碍", "建议", "结果"]),
    spread("cross", "五牌十字", "适合矛盾点、卡点和下一步。", ["核心问题", "阻碍", "根源", "可用资源", "建议"]),
    spread("celtic", "凯尔特十字", "适合重大、复杂、长期的问题。", ["现状", "挑战", "潜意识", "过去", "显意识", "近未来", "你的态度", "环境影响", "希望与恐惧", "结果"]),
    spread("week", "一周能量", "适合短周期计划和节奏安排。", ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]),
    spread("month", "月度主题", "适合未来一个月的整体提醒。", ["月初", "月中", "月末", "机会", "挑战", "行动建议"]),
    spread("zodiac", "十二宫牌阵", "适合年度、综合运势和多领域总览。", ["自我", "金钱", "沟通", "家庭", "创造", "健康", "关系", "转化", "远方", "事业", "社群", "潜意识"]),
    spread("mindbody", "身心灵牌阵", "适合状态调整、焦虑和内在照顾。", ["身体", "情绪", "思想", "灵魂建议"]),
    spread("chakra", "七脉轮牌阵", "适合能量觉察和自我修复。", ["海底轮", "脐轮", "太阳轮", "心轮", "喉轮", "眉心轮", "顶轮"]),
    spread("shadow", "阴影整合", "适合反复卡住、执念和潜意识议题。", ["表层问题", "被压抑的需求", "阴影来源", "你逃避的真相", "整合方式"]),
    spread("innerchild", "内在小孩", "适合情绪创伤、委屈和自我安抚。", ["受伤处", "它想说的话", "保护机制", "现在的支持", "疗愈行动"]),
    spread("newmoon", "新月许愿", "适合开启计划、设定意图。", ["新意图", "播种资源", "需要释放", "行动仪式"]),
    spread("fullmoon", "满月释放", "适合复盘、完成和放下。", ["已经成熟的事", "需要看见的情绪", "该释放的负担", "收获"]),
    spread("conflict", "冲突沟通", "适合争执、误会、谈判。", ["你的立场", "对方立场", "真正冲突", "可沟通点", "界限", "建议"]),
    spread("calling", "天赋使命", "适合人生方向、职业召唤和长期选择。", ["天赋", "渴望", "恐惧", "世界需要你给出的", "下一步"])
  ];

  const state = {
    activeView: "home",
    spread: spreads[1],
    question: "",
    drawPool: [],
    drawn: [],
    fanOpen: false,
    readingText: "",
    conversation: [],
    detailSpread: null,
    spreadChoice: null,
    streaming: false
  };

  const deck = buildDeck();

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    renderSpreadShowcase();
    renderLibrary();
    loadApiSettings();
    bindEvents();
    const query = new URLSearchParams(location.search).get("q");
    if (query) $("questionInput").value = query;
  }

  function bindEvents() {
    $("advisorButton").addEventListener("click", chooseSpread);
    $("beginButton").addEventListener("click", beginRitual);
    $("deckButton").addEventListener("click", expandDeck);
    $("askDeepSeek").addEventListener("click", () => showReading(true));
    $("closeReading").addEventListener("click", closeReading);
    $("closeSpreadDetail").addEventListener("click", closeSpreadDetail);
    $("useSpreadFromDetail").addEventListener("click", useDetailSpread);
    $("backHomeButton").addEventListener("click", () => switchView("home"));
    $("resetButton").addEventListener("click", resetRitual);
    $("soundButton").addEventListener("click", softChime);
    $("questionInput").addEventListener("input", () => prepareForNewQuestion(false));
    $("dailyDrawButton").addEventListener("click", drawDaily);
    $("apiSettingsForm").addEventListener("submit", saveApiSettings);
    $("followUpForm").addEventListener("submit", submitFollowUp);
    $("endReadingSession").addEventListener("click", endReadingSession);
    document.querySelectorAll("[data-followup-prompt]").forEach((button) => {
      button.addEventListener("click", () => {
        $("followUpInput").value = button.dataset.followupPrompt;
        $("followUpInput").focus();
      });
    });
    document.querySelector(".bottom-nav").addEventListener("click", (event) => {
      const button = event.target.closest("[data-nav]");
      if (button) switchView(button.dataset.nav);
    });
    window.siwenSwitchView = switchView;
    window.renderLibrary = renderLibrary;
    window.loadApiSettings = loadApiSettings;
  }

  function spread(key, name, reason, positions) {
    return { key, name, reason, positions };
  }

  function spreadIntro(item) {
    const count = item.positions.length;
    if (count === 1) return "适合在你已经有明确问题时，快速抓住今天最重要的一句提醒。使用时先安静下来，把问题缩短成一句话，再抽一张。";
    if (count <= 3) return "适合时间线、现状梳理和轻量咨询。重点不是把未来说死，而是看清事情如何从过去延伸到现在，并给出下一步方向。";
    if (count <= 6) return "适合一件具体事情的深度拆解。它会同时看见资源、阻碍、隐藏变量和行动建议，适合事业、关系、财富等现实问题。";
    if (count <= 8) return "适合中周期或能量结构的观察。每个位置都对应一个维度，解读时要先逐张看，再合并成整体节奏。";
    return "适合重大、长期、复合型议题。牌数较多，信息量大，更适合年度趋势、人生方向或一个阶段的系统复盘。";
  }

  function buildDeck() {
    const majors = majorCards.map((item, index) => ({
      id: `major-${index}`,
      arcana: "大阿尔克那",
      name: item[0],
      keyword: item[1],
      meaning: item[2],
      image: `./assets/rider-waite/${majorFiles[index]}`
    }));
    const minors = suitConfigs.flatMap(([suit, code, element, theme]) => {
      return rankNames.map((rank, index) => ({
        id: `${code}-${index + 1}`,
        arcana: "小阿尔克那",
        suit,
        name: `${suit}${rank}`,
        keyword: `${element} · ${rankKeywords[index]}`,
        meaning: `${theme}。这张牌提醒你关注“${rankKeywords[index]}”在当前问题中的表现。`,
        image: `./assets/rider-waite/${code}${String(index + 1).padStart(2, "0")}.jpg`
      }));
    });
    return majors.concat(minors);
  }

  async function chooseSpread() {
    const question = $("questionInput").value.trim();
    if (!question) {
      $("questionInput").focus();
      return;
    }
    state.question = question;
    $("advisorButton").textContent = "塔罗师正在判断...";
    $("advisorButton").disabled = true;
    state.spread = await chooseSpreadWithAI(question);
    state.spreadChoice = "ai";
    renderSpreadAdvice();
    $("advisorButton").hidden = true;
    $("beginButton").hidden = false;
    $("advisorButton").disabled = false;
    $("advisorButton").textContent = "✦ 让 AI 选择牌阵 ✦";
  }

  async function chooseSpreadWithAI(question) {
    const fallback = chooseSpreadByHeuristic(question);
    if (!hasApiConfig()) return fallback;
    try {
      const spreadList = spreads.map((item) => `${item.key}: ${item.name}，${item.positions.length}张，${item.reason}`).join("\n");
      const text = await requestDeepSeekText([
        { role: "system", content: "你是一位经验丰富的塔罗师。请只返回 JSON，格式为 {\"key\":\"牌阵key\",\"reason\":\"一句中文原因\"}。" },
        { role: "user", content: `问题：${question}\n可选牌阵：\n${spreadList}` }
      ], 0.18, 600);
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
      const found = spreads.find((item) => item.key === parsed.key) || fallback;
      return { ...found, reason: parsed.reason || found.reason };
    } catch (error) {
      return fallback;
    }
  }

  function chooseSpreadByHeuristic(question) {
    const q = question.toLowerCase();
    const has = (...words) => words.some((word) => q.includes(word));
    if (has("一年", "年度", "全年", "整体趋势", "综合")) return getSpread("zodiac");
    if (has("事业", "工作", "职业", "项目", "晋升")) return getSpread("career");
    if (has("钱", "财富", "收入", "投资", "财务")) return getSpread("money");
    if (has("关系", "感情", "复合", "喜欢", "伴侣", "暧昧")) return getSpread("relationship");
    if (has("选择", "还是", "要不要", "哪一个", "二选一")) return getSpread("choice");
    if (has("能不能", "会不会", "是否", "可不可以")) return getSpread("yesno");
    if (has("冲突", "争执", "误会", "谈判")) return getSpread("conflict");
    if (has("阴影", "执念", "卡住", "反复")) return getSpread("shadow");
    if (has("疗愈", "委屈", "童年", "内在小孩")) return getSpread("innerchild");
    if (has("一周", "本周")) return getSpread("week");
    if (has("一个月", "月度", "本月")) return getSpread("month");
    if (has("使命", "天赋", "人生方向")) return getSpread("calling");
    if (question.length > 38) return getSpread("celtic");
    return getSpread("three");
  }

  function getSpread(key) {
    return spreads.find((item) => item.key === key) || spreads[1];
  }

  function renderSpreadAdvice() {
    $("spreadAdvisor").hidden = false;
    $("spreadName").textContent = state.spread.name;
    $("spreadReason").textContent = state.spread.reason;
    $("spreadPositions").innerHTML = state.spread.positions.map((pos, index) => `<span>${index + 1}. ${escapeHtml(pos)}</span>`).join("");
  }

  function renderSpreadShowcase() {
    $("spreadShowcase").innerHTML = spreads.map((item) => `
      <button class="spread-tile" data-spread="${item.key}">
        <b>${escapeHtml(item.name)}</b>
        <span>${item.positions.length} 张 · ${escapeHtml(item.positions.slice(0, 3).join(" / "))}</span>
        <small>查看介绍</small>
      </button>
    `).join("");
    $("spreadShowcase").addEventListener("click", (event) => {
      const tile = event.target.closest("[data-spread]");
      if (!tile) return;
      openSpreadDetail(getSpread(tile.dataset.spread));
    });
  }

  function openSpreadDetail(item) {
    state.detailSpread = item;
    $("spreadDetailTitle").textContent = `${item.name} · ${item.positions.length} 张`;
    $("spreadDetailReason").textContent = `${item.reason} ${spreadIntro(item)}`;
    $("spreadDetailPositions").innerHTML = item.positions.map((pos, index) => `<span>${index + 1}. ${escapeHtml(pos)}</span>`).join("");
    $("spreadDetailSheet").classList.add("open");
    $("spreadDetailSheet").setAttribute("aria-hidden", "false");
  }

  function closeSpreadDetail() {
    $("spreadDetailSheet").classList.remove("open");
    $("spreadDetailSheet").setAttribute("aria-hidden", "true");
  }

  function useDetailSpread() {
    if (!state.detailSpread) return;
    state.spread = { ...state.detailSpread, reason: `你手动选择了${state.detailSpread.name}。${state.detailSpread.reason}` };
    state.spreadChoice = "manual";
    state.question = $("questionInput").value.trim();
    closeSpreadDetail();
    renderSpreadAdvice();
    $("advisorButton").hidden = true;
    $("beginButton").hidden = false;
    $("beginButton").scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function beginRitual() {
    state.question = $("questionInput").value.trim() || state.question || "我此刻需要看见什么？";
    if (!$("spreadAdvisor").hidden) renderSpreadAdvice();
    if (!state.spread) state.spread = getSpread("three");
    state.drawn = [];
    state.readingText = "";
    state.fanOpen = false;
    state.drawPool = shuffle(deck).slice(0, Math.min(Math.max(12, state.spread.positions.length + 6), 18));
    $("ritualCopy").innerHTML = `<span>正在展开牌背</span><b>凭直觉抽 ${state.spread.positions.length} 张。</b><small>${escapeHtml(state.spread.name)} · ${state.drawn.length}/${state.spread.positions.length} 已抽取</small>`;
    $("drawFan").innerHTML = "";
    $("drawnCards").innerHTML = "";
    $("deckButton").hidden = false;
    switchView("home");
    document.querySelectorAll(".app-view").forEach((panel) => panel.hidden = true);
    $("deckStage").hidden = false;
    $("deckStage").classList.add("active");
    $("ritualScreen").classList.add("drawing-mode");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function expandDeck() {
    state.fanOpen = true;
    $("deckButton").hidden = true;
    $("drawFan").innerHTML = state.drawPool.map((card, index) => {
      const total = state.drawPool.length;
      const angle = -42 + (84 / Math.max(total - 1, 1)) * index;
      const x = -44 + (88 / Math.max(total - 1, 1)) * index;
      return `<button class="fan-card" style="--angle:${angle}deg;--x:${x}px;--delay:${index * 24}ms" data-card="${card.id}" aria-label="抽牌"><img src="./assets/card-back.png" alt=""></button>`;
    }).join("");
    $("drawFan").querySelectorAll(".fan-card").forEach((button) => {
      button.addEventListener("click", () => selectFanCard(button.dataset.card, button));
    });
  }

  function selectFanCard(cardId, button) {
    if (state.drawn.length >= state.spread.positions.length) return;
    const card = state.drawPool.find((item) => item.id === cardId);
    if (!card || state.drawn.some((item) => item.id === cardId)) return;
    button.disabled = true;
    button.classList.add("picked");
    state.drawn.push({
      ...card,
      position: state.spread.positions[state.drawn.length],
      reversed: Math.random() > 0.72,
      revealed: false
    });
    $("ritualCopy").innerHTML = `<span>${state.drawn.length}/${state.spread.positions.length} 已抽取</span><b>${state.drawn.length >= state.spread.positions.length ? "牌阵已摆好，逐张点开。" : `再抽 ${state.spread.positions.length - state.drawn.length} 张。`}</b><small>${escapeHtml(state.spread.name)}</small>`;
    renderDrawnCards();
  }

  function renderDrawnCards() {
    $("drawnCards").className = `drawn-cards count-${state.drawn.length}`;
    $("drawnCards").innerHTML = state.drawn.map((card, index) => cardMarkup(card, index)).join("");
    $("drawnCards").querySelectorAll("[data-reveal-card]").forEach((button) => {
      button.addEventListener("click", () => revealCard(Number(button.dataset.revealCard)));
    });
  }

  function cardMarkup(card, index) {
    const isBack = !card.revealed;
    return `
      <article class="tarot-result-card${isBack ? " unrevealed" : " revealed"}">
        <div class="card-position">${index + 1}. ${escapeHtml(card.position)}</div>
        ${isBack
          ? `<button class="reveal-card-button" data-reveal-card="${index}" aria-label="翻开${escapeHtml(card.position)}"><img class="waite-card-image card-back-image" src="./assets/card-back.png" alt="牌背" /></button><h3>等待翻开</h3><p>轻触查看这张牌</p>`
          : `<img class="waite-card-image${card.reversed ? " reversed-image" : ""}" src="${card.image}" alt="${escapeHtml(card.name)}" /><h3>${escapeHtml(card.name)}${card.reversed ? " · 逆位" : " · 正位"}</h3><p>${escapeHtml(card.keyword)}</p>`}
      </article>
    `;
  }

  function revealCard(index) {
    const card = state.drawn[index];
    if (!card || card.revealed) return;
    card.revealed = true;
    softChime();
    renderDrawnCards();
    const revealed = state.drawn.filter((item) => item.revealed).length;
    $("ritualCopy").innerHTML = `<span>${revealed}/${state.spread.positions.length} 已翻开</span><b>${revealed >= state.spread.positions.length ? "牌面已经全部显现。" : `继续翻开 ${state.spread.positions.length - revealed} 张。`}</b><small>${escapeHtml(state.spread.name)}</small>`;
    if (revealed === state.spread.positions.length) {
      setTimeout(() => showReading(false), 420);
    }
  }

  async function showReading(useAI) {
    $("readingSheet").classList.add("open");
    $("readingSheet").setAttribute("aria-hidden", "false");
    $("readingTitle").textContent = `${state.spread.name} · 解读`;
    $("followUpPanel").hidden = true;
    $("askDeepSeek").hidden = false;
    if (!state.drawn.length) return;
    if (state.drawn.some((card) => !card.revealed)) {
      $("readingBody").innerHTML = `<div class="reading-question">请先逐张翻开所有牌，再开始解读。</div>`;
      $("askDeepSeek").hidden = true;
      return;
    }
    $("readingBody").innerHTML = renderCardsSummary();
    if (!useAI) return;
    $("askDeepSeek").disabled = true;
    $("askDeepSeek").textContent = "AI 正在解牌...";
    state.streaming = true;
    const streamTarget = document.createElement("div");
    streamTarget.className = "interpretation streaming-text";
    streamTarget.innerHTML = "<p>正在连接塔罗师...</p>";
    $("readingBody").appendChild(streamTarget);
    try {
      state.readingText = await readWithDeepSeekStream((partial) => {
        streamTarget.innerHTML = renderTextBlocks(partial, true);
        streamTarget.scrollIntoView({ block: "end", behavior: "smooth" });
      });
    } catch (error) {
      state.readingText = localReading();
      await typeText(streamTarget, state.readingText);
    }
    streamTarget.innerHTML = renderTextBlocks(state.readingText, true);
    $("followUpPanel").hidden = false;
    state.conversation = [
      { role: "user", content: state.question },
      { role: "assistant", content: state.readingText }
    ];
    $("askDeepSeek").hidden = true;
    $("askDeepSeek").disabled = false;
    $("askDeepSeek").textContent = "✦ 让 AI 解牌 ✦";
    state.streaming = false;
  }

  function renderCardsSummary() {
    return `
      <div class="reading-question">${escapeHtml(state.question)}</div>
      <div class="spread-layout spread-${state.spread.key}">
        ${state.drawn.map((card, index) => cardMarkup(card, index)).join("")}
      </div>
    `;
  }

  async function readWithDeepSeek() {
    const cards = state.drawn.map((card, index) => `${index + 1}.${card.position}：${card.name}${card.reversed ? "逆位" : "正位"}，关键词：${card.keyword}`).join("\n");
    return requestDeepSeekText([
      { role: "system", content: "你是一位经验丰富、温柔但不含糊的塔罗师。请用中文完整解读，包含总览、逐张牌、整合建议、未来行动。避免绝对化预测和医疗法律金融断言。" },
      { role: "user", content: `我的问题：${state.question}\n牌阵：${state.spread.name}\n抽到的牌：\n${cards}\n请给我一份完整但好读的解牌。` }
    ], 0.45, 4200);
  }

  async function readWithDeepSeekStream(onDelta) {
    const cards = state.drawn.map((card, index) => `${index + 1}.${card.position}：${card.name}${card.reversed ? "逆位" : "正位"}，关键词：${card.keyword}`).join("\n");
    return requestDeepSeekStream([
      { role: "system", content: "你是一位经验丰富、温柔但不含糊的塔罗师。请用中文完整解读，包含总览、逐张牌、整合建议、未来行动。避免绝对化预测和医疗法律金融断言。" },
      { role: "user", content: `我的问题：${state.question}\n牌阵：${state.spread.name}\n抽到的牌：\n${cards}\n请给我一份完整但好读的解牌。` }
    ], 0.45, 4200, onDelta);
  }

  async function submitFollowUp(event) {
    event.preventDefault();
    const input = $("followUpInput");
    const question = input.value.trim();
    if (!question) return;
    appendFollowUp("me", question);
    input.value = "";
    appendFollowUp("ai", "正在继续看这组牌...");
    try {
      const cards = state.drawn.map((card, index) => `${index + 1}.${card.position}：${card.name}${card.reversed ? "逆位" : "正位"}`).join("\n");
      const holder = $("followUpMessages").querySelector(".ai:last-child");
      const answer = await requestDeepSeekStream([
        { role: "system", content: "你延续同一次塔罗牌局回答追问，只能基于已抽到的牌继续解释。中文回答，清晰、具体、不过度神秘化。" },
        ...state.conversation.slice(-8),
        { role: "user", content: `原问题：${state.question}\n牌：\n${cards}\n追问：${question}` }
      ], 0.42, 1800, (partial) => {
        if (holder) holder.textContent = partial || "正在继续看这组牌...";
      });
      state.conversation.push({ role: "user", content: question }, { role: "assistant", content: answer });
      replaceLastFollowUp(answer);
    } catch (error) {
      replaceLastFollowUp("这次没有连上 API。就牌面看，先回到最关键的一张牌：它提示你把问题拆小，用一个可执行动作验证答案。");
    }
  }

  function appendFollowUp(who, text) {
    const node = document.createElement("div");
    node.className = `follow-up-message ${who}`;
    node.textContent = text;
    $("followUpMessages").appendChild(node);
    node.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  function replaceLastFollowUp(text) {
    const messages = $("followUpMessages").querySelectorAll(".ai");
    const last = messages[messages.length - 1];
    if (last) last.textContent = text;
  }

  function endReadingSession() {
    prepareForNewQuestion(true);
    switchView("home");
    $("questionInput").focus();
  }

  function renderTextBlocks(text, innerOnly) {
    const html = escapeHtml(text || "").split(/\n{2,}/).filter(Boolean).map((part) => `<p>${part.replace(/\n/g, "<br>")}</p>`).join("") || "<p>正在展开解读...</p>";
    return innerOnly ? html : `<div class="interpretation">${html}</div>`;
  }

  function localReading() {
    const opening = `这次牌阵的核心，是“${state.drawn[0].name}”带出的主题：${state.drawn[0].meaning}`;
    const lines = state.drawn.map((card) => `${card.position}上出现${card.name}${card.reversed ? "逆位" : "正位"}，说明${card.meaning}${card.reversed ? " 逆位让它更像一个需要被调整、松绑或重新理解的课题。" : ""}`);
    return [opening, ...lines, "整合建议：不要急着把所有答案一次性定死。先选择最能推进现实的一步，让下一张牌在行动之后显现。"].join("\n\n");
  }

  function switchView(view) {
    state.activeView = view;
    closeReading();
    window.scrollTo({ top: 0, behavior: "auto" });
    $("ritualScreen").classList.remove("drawing-mode");
    $("deckStage").hidden = true;
    $("deckStage").classList.remove("active");
    document.querySelectorAll(".app-view").forEach((panel) => {
      const active = panel.dataset.view === view;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    document.querySelectorAll("[data-nav]").forEach((button) => button.classList.toggle("active", button.dataset.nav === view));
    closeSpreadDetail();
    if (view === "library") renderLibrary();
    if (view === "profile") loadApiSettings();
  }

  function renderLibrary() {
    if (!$("libraryGrid")) return;
    $("libraryGrid").innerHTML = deck.map((card) => `
      <article class="library-card">
        <img src="${card.image}" alt="${escapeHtml(card.name)}" loading="lazy" />
        <div>
          <span>${escapeHtml(card.arcana)}${card.suit ? " · " + escapeHtml(card.suit) : ""}</span>
          <h3>${escapeHtml(card.name)}</h3>
          <p>${escapeHtml(card.keyword)}</p>
        </div>
      </article>
    `).join("");
  }

  function drawDaily() {
    const today = new Date().toISOString().slice(0, 10);
    let saved = safeJson(localStorage.getItem(storage.daily));
    if (!saved || saved.date !== today) {
      const card = shuffle(deck)[0];
      saved = { date: today, id: card.id, reversed: Math.random() > 0.78 };
      localStorage.setItem(storage.daily, JSON.stringify(saved));
    }
    const card = deck.find((item) => item.id === saved.id) || deck[0];
    $("dailyResult").innerHTML = `
      <article class="daily-card tarot-result-card">
        <img class="waite-card-image${saved.reversed ? " reversed-image" : ""}" src="${card.image}" alt="${escapeHtml(card.name)}" />
        <h3>${escapeHtml(card.name)}${saved.reversed ? " · 逆位" : " · 正位"}</h3>
        <p>${escapeHtml(card.meaning)}</p>
      </article>
    `;
  }

  function loadApiSettings() {
    $("apiKeyInput").value = localStorage.getItem(storage.apiKey) || "";
    $("apiModelInput").value = localStorage.getItem(storage.model) || "deepseek-chat";
    $("apiBaseInput").value = localStorage.getItem(storage.base) || "https://api.deepseek.com/chat/completions";
  }

  function saveApiSettings(event) {
    event.preventDefault();
    localStorage.setItem(storage.apiKey, $("apiKeyInput").value.trim());
    localStorage.setItem(storage.model, $("apiModelInput").value.trim() || "deepseek-chat");
    localStorage.setItem(storage.base, $("apiBaseInput").value.trim() || "https://api.deepseek.com/chat/completions");
    $("apiSettingsStatus").textContent = "已保存到本机。";
    setTimeout(() => $("apiSettingsStatus").textContent = "", 1800);
  }

  function hasApiConfig() {
    return Boolean(localStorage.getItem(storage.apiKey));
  }

  function requestDeepSeekText(messages, temperature, maxTokens) {
    const apiKey = localStorage.getItem(storage.apiKey);
    const model = localStorage.getItem(storage.model) || "deepseek-chat";
    const baseURL = localStorage.getItem(storage.base) || "https://api.deepseek.com/chat/completions";
    if (!apiKey) return Promise.reject(new Error("Missing API key"));
    const payload = { id: `ds-${Date.now()}-${Math.random().toString(16).slice(2)}`, apiKey, model, baseURL, messages, temperature, maxTokens };
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.deepseek) {
      return new Promise((resolve, reject) => {
        const listener = (event) => {
          if (!event.detail || event.detail.id !== payload.id) return;
          window.removeEventListener("deepseek-response", listener);
          if (event.detail.error) reject(new Error(event.detail.error));
          else resolve(event.detail.data.choices?.[0]?.message?.content || "");
        };
        window.addEventListener("deepseek-response", listener);
        window.webkit.messageHandlers.deepseek.postMessage(payload);
      });
    }
    return fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens })
    }).then((response) => {
      if (!response.ok) throw new Error(`DeepSeek ${response.status}`);
      return response.json();
    }).then((json) => json.choices?.[0]?.message?.content || "");
  }

  function requestDeepSeekStream(messages, temperature, maxTokens, onDelta) {
    const apiKey = localStorage.getItem(storage.apiKey);
    const model = localStorage.getItem(storage.model) || "deepseek-chat";
    const baseURL = localStorage.getItem(storage.base) || "https://api.deepseek.com/chat/completions";
    if (!apiKey) return Promise.reject(new Error("Missing API key"));
    const payload = { id: `dss-${Date.now()}-${Math.random().toString(16).slice(2)}`, apiKey, model, baseURL, messages, temperature, maxTokens };
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.deepseekStream) {
      return new Promise((resolve, reject) => {
        let full = "";
        const listener = (event) => {
          if (!event.detail || event.detail.id !== payload.id) return;
          if (event.detail.delta) {
            full += event.detail.delta;
            onDelta(full);
          }
          if (event.detail.error) {
            window.removeEventListener("deepseek-stream", listener);
            reject(new Error(event.detail.error));
          }
          if (event.detail.done) {
            window.removeEventListener("deepseek-stream", listener);
            if (full.trim()) resolve(full);
            else reject(new Error("Empty DeepSeek stream"));
          }
        };
        window.addEventListener("deepseek-stream", listener);
        window.webkit.messageHandlers.deepseekStream.postMessage(payload);
      });
    }
    return fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true })
    }).then(async (response) => {
      if (!response.ok || !response.body) throw new Error(`DeepSeek ${response.status}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          const json = safeJson(data);
          const delta = json?.choices?.[0]?.delta?.content || "";
          if (delta) {
            full += delta;
            onDelta(full);
          }
        }
      }
      if (!full.trim()) throw new Error("Empty DeepSeek stream");
      return full;
    });
  }

  async function typeText(container, text) {
    let current = "";
    const step = Math.max(2, Math.ceil(text.length / 160));
    for (let index = 0; index < text.length; index += step) {
      current = text.slice(0, index + step);
      container.innerHTML = renderTextBlocks(current, true);
      if (index % (step * 10) === 0) container.scrollIntoView({ block: "end", behavior: "smooth" });
      await new Promise((resolve) => setTimeout(resolve, 14));
    }
  }

  function prepareForNewQuestion(force) {
    const forced = force === true;
    const currentQuestion = $("questionInput").value.trim();
    const hasActiveSession = state.drawn.length || state.drawPool.length || state.readingText;
    const hasChosenSpread = !$("spreadAdvisor").hidden && !$("beginButton").hidden;
    if (!forced && hasChosenSpread && !hasActiveSession) {
      if (state.spreadChoice === "manual") {
        state.question = currentQuestion;
        return;
      }
      if (currentQuestion === state.question) return;
    }
    if (!forced && !state.question && !hasActiveSession) return;
    const hasPreviousState = !$("spreadAdvisor").hidden || !$("beginButton").hidden || state.drawn.length || state.drawPool.length || state.readingText;
    if (!forced && !hasPreviousState) return;
    state.drawn = [];
    state.drawPool = [];
    state.fanOpen = false;
    state.readingText = "";
    state.conversation = [];
    state.spreadChoice = null;
    state.streaming = false;
    $("spreadAdvisor").hidden = true;
    $("advisorButton").hidden = false;
    $("beginButton").hidden = true;
    $("drawFan").innerHTML = "";
    $("drawnCards").innerHTML = "";
    $("followUpMessages").innerHTML = "";
    closeSpreadDetail();
    closeReading();
  }

  function resetRitual() {
    $("questionInput").value = "";
    prepareForNewQuestion(true);
    switchView("home");
  }

  function closeReading() {
    $("readingSheet").classList.remove("open");
    $("readingSheet").setAttribute("aria-hidden", "true");
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function safeJson(value) {
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  function softChime() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    const ctx = new Context();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 660;
    gain.gain.value = 0.035;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.52);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }
})();
