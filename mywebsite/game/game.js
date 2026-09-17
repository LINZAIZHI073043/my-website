(() => {
  "use strict";

  const STORAGE_KEY = "neonLexiconWordsV1";
  const ROUND_SIZE = 6;
  const DEFAULT_WORDS = [
    { en: "algorithm", zh: "算法" }, { en: "network", zh: "网络" },
    { en: "database", zh: "数据库" }, { en: "interface", zh: "界面" },
    { en: "creative", zh: "有创造力的" }, { en: "future", zh: "未来" }
  ];
  const $ = (selector) => document.querySelector(selector);
  const board = $("#board"), timeNode = $("#time"), movesNode = $("#moves");
  const matchesNode = $("#matches"), pairTotalNode = $("#pair-total"), scoreNode = $("#score");
  const statusNode = $("#status"), dialog = $("#result-dialog"), messageNode = $("#vocab-message");
  const wordCountNode = $("#word-count"), fileInput = $("#word-file");

  let words = loadWords(), roundWords = [];
  let first = null, second = null, lock = false, started = false, ended = false;
  let time = 60, moves = 0, matches = 0, score = 0, timer = null, sound = true, audioContext;

  const normalizeText = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
  const keyFor = (value) => normalizeText(value).toLocaleLowerCase("en-US");
  const cleanWord = (word) => ({ en: normalizeText(word.en), zh: normalizeText(word.zh) });

  function loadWords() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) {
        const valid = saved.map(cleanWord).filter((word) => word.en && word.zh);
        if (valid.length) return valid;
      }
    } catch { /* 使用默认词库 */ }
    return DEFAULT_WORDS.map((word) => ({ ...word }));
  }

  function saveWords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    wordCountNode.textContent = String(words.length);
  }

  function showMessage(text, type = "") {
    messageNode.textContent = text;
    messageNode.className = `vocab-message${type ? ` ${type}` : ""}`;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function tone(frequency, duration = .08, type = "sine") {
    if (!sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = type; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch { /* 音效不是游戏核心功能 */ }
  }

  function deck() {
    return shuffle(roundWords.flatMap((word, index) => {
      const slug = keyFor(word.en).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "word";
      const id = `${slug}-${index}`;
      return [{ id, label: word.en, type: "ENGLISH" }, { id, label: word.zh, type: "中文释义" }];
    }));
  }

  function render() {
    board.innerHTML = "";
    deck().forEach((item, index) => {
      const card = document.createElement("button");
      card.type = "button"; card.className = "card";
      card.dataset.id = item.id; card.dataset.type = item.type;
      card.setAttribute("aria-label", `未翻开的第 ${index + 1} 张卡片`);
      const front = document.createElement("span"), back = document.createElement("span"), type = document.createElement("small");
      front.className = "card-face card-front"; back.className = "card-face card-back";
      back.append(document.createTextNode(item.label)); type.textContent = item.type; back.append(type);
      card.append(front, back); card.addEventListener("click", () => flip(card)); board.append(card);
    });
  }

  function start() {
    if (started) return;
    started = true; statusNode.textContent = "矩阵已启动：寻找匹配连接";
    timer = setInterval(() => {
      time -= 1; timeNode.textContent = time;
      if (time <= 10) timeNode.style.color = "var(--pink)";
      if (time <= 0) finish(false);
    }, 1000);
  }

  function flip(card) {
    if (ended || lock || card === first || card.classList.contains("matched")) return;
    start(); tone(440, .05, "square"); card.classList.add("flipped");
    card.setAttribute("aria-label", `已翻开：${card.querySelector(".card-back").firstChild.textContent}`);
    if (!first) { first = card; return; }
    second = card; lock = true; moves += 1; movesNode.textContent = moves;
    const isMatch = first.dataset.id === second.dataset.id && first.dataset.type !== second.dataset.type;
    if (isMatch) {
      first.classList.add("matched"); second.classList.add("matched");
      matches += 1; score += 140 + time * 2; matchesNode.textContent = matches; updateScore();
      statusNode.textContent = "连接成功：数据同步完成"; tone(760, .12); setTimeout(() => tone(980, .14), 90);
      clearPick(); if (matches === roundWords.length) setTimeout(() => finish(true), 420);
    } else {
      score = Math.max(0, score - 15); updateScore();
      first.classList.add("wrong"); second.classList.add("wrong");
      statusNode.textContent = "连接失败：重新扫描"; tone(150, .18, "sawtooth");
      const firstCard = first, secondCard = second;
      setTimeout(() => {
        firstCard.classList.remove("flipped", "wrong"); secondCard.classList.remove("flipped", "wrong");
        firstCard.setAttribute("aria-label", "未翻开的卡片"); secondCard.setAttribute("aria-label", "未翻开的卡片"); clearPick();
      }, 760);
    }
  }

  function clearPick() { first = null; second = null; lock = false; }
  function updateScore() { scoreNode.textContent = String(score).padStart(4, "0"); }

  function finish(win) {
    if (ended) return;
    ended = true; clearInterval(timer); if (win) score += time * 10; updateScore();
    $("#result-title").textContent = win ? "词库封锁已解除" : "训练时间结束";
    $("#result-copy").textContent = win
      ? `你用 ${moves} 步完成了全部 ${roundWords.length} 组连接，剩余 ${time} 秒。`
      : `你完成了 ${matches}/${roundWords.length} 组连接，再试一次即可刷新记录。`;
    $("#final-score").textContent = String(score).padStart(4, "0");
    tone(win ? 1040 : 120, .35, win ? "sine" : "sawtooth"); dialog.showModal();
  }

  function reset() {
    clearInterval(timer); first = null; second = null; lock = false; started = false; ended = false;
    time = 60; moves = 0; matches = 0; score = 0; roundWords = shuffle(words).slice(0, ROUND_SIZE);
    timeNode.textContent = "60"; timeNode.style.color = ""; movesNode.textContent = "0"; matchesNode.textContent = "0";
    pairTotalNode.textContent = String(roundWords.length); updateScore(); statusNode.textContent = "点击任意卡片开始训练";
    if (dialog.open) dialog.close(); render();
  }

  function addWords(candidates) {
    const existing = new Set(words.map((word) => keyFor(word.en)));
    let added = 0, duplicates = 0, invalid = 0;
    candidates.forEach((candidate) => {
      const word = cleanWord(candidate);
      if (!word.en || !word.zh) { invalid += 1; return; }
      const key = keyFor(word.en);
      if (existing.has(key)) { duplicates += 1; return; }
      words.push(word); existing.add(key); added += 1;
    });
    if (added) { saveWords(); reset(); }
    return { added, duplicates, invalid };
  }

  function rowsToWords(rows) {
    const filtered = rows.filter((row) => Array.isArray(row) && row.some((cell) => normalizeText(cell)));
    if (!filtered.length) return [];
    const firstRow = filtered[0];
    const enHeaders = ["英文单词", "英文", "english", "word", "单词"];
    const zhHeaders = ["中文释义", "中文", "chinese", "meaning", "释义", "翻译"];
    let enIndex = firstRow.findIndex((cell) => enHeaders.includes(keyFor(cell)));
    let zhIndex = firstRow.findIndex((cell) => zhHeaders.includes(keyFor(cell)));
    const hasHeader = enIndex >= 0 || zhIndex >= 0;
    if (enIndex < 0) enIndex = 0;
    if (zhIndex < 0) zhIndex = enIndex === 0 ? 1 : 0;
    return filtered.slice(hasHeader ? 1 : 0).map((row) => ({ en: row[enIndex], zh: row[zhIndex] }));
  }

  function parseCsv(text) {
    const rows = []; let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' && quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { row.push(field); field = ""; }
      else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && text[i + 1] === "\n") i += 1;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += char;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  async function importFile(file) {
    const extension = file.name.split(".").pop().toLowerCase();
    let rows;
    if (extension === "csv") rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
    else {
      if (!window.XLSX) throw new Error("Excel 解析组件未加载，请刷新页面后重试。");
      const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array" });
      rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "", raw: false });
    }
    const result = addWords(rowsToWords(rows));
    if (!result.added && !result.duplicates && !result.invalid) throw new Error("文件中没有可识别的单词数据。");
    const details = [`成功添加 ${result.added} 个单词`];
    if (result.duplicates) details.push(`跳过 ${result.duplicates} 个重复项`);
    if (result.invalid) details.push(`跳过 ${result.invalid} 个空缺项`);
    showMessage(details.join("，") + "。", result.added ? "success" : "error");
  }

  $("#word-form").addEventListener("submit", (event) => {
    event.preventDefault(); const enInput = $("#english-input"), zhInput = $("#chinese-input");
    const enteredWord = normalizeText(enInput.value), result = addWords([{ en: enInput.value, zh: zhInput.value }]);
    if (result.added) {
      showMessage(`已添加“${enteredWord}”，并重新生成本局矩阵。`, "success");
      event.currentTarget.reset(); enInput.focus();
    } else showMessage(result.duplicates ? "该英文单词已存在，未重复添加。" : "请完整填写英文单词和中文释义。", "error");
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0]; if (!file) return; showMessage(`正在读取 ${file.name}…`);
    try { await importFile(file); }
    catch (error) { showMessage(error.message || "导入失败，请检查文件格式。", "error"); }
    finally { fileInput.value = ""; }
  });

  $("#reset-words").addEventListener("click", () => {
    if (!window.confirm("确认删除浏览器中添加的单词并恢复默认词库吗？")) return;
    words = DEFAULT_WORDS.map((word) => ({ ...word })); saveWords(); reset(); showMessage("已恢复默认词库。", "success");
  });
  $("#restart").addEventListener("click", reset); $("#play-again").addEventListener("click", reset);
  $(".sound-btn").addEventListener("click", (event) => {
    sound = !sound; event.currentTarget.textContent = sound ? "SFX ON" : "SFX OFF";
    event.currentTarget.setAttribute("aria-pressed", String(sound));
    event.currentTarget.setAttribute("aria-label", sound ? "关闭游戏音效" : "打开游戏音效");
  });

  const canvas = $("#game-canvas"), ctx = canvas.getContext("2d"); let particles = [];
  function resize() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    particles = Array.from({ length: Math.min(70, Math.floor(innerWidth / 18)) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, v: .3 + Math.random(), s: 1 + Math.random() * 2 }));
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#35f2ff";
    particles.forEach((particle) => {
      ctx.globalAlpha = .1 + Math.random() * .25; ctx.fillRect(particle.x, particle.y, particle.s, particle.s * 5);
      particle.y += particle.v; if (particle.y > innerHeight) { particle.y = -10; particle.x = Math.random() * innerWidth; }
    }); requestAnimationFrame(animate);
  }

  wordCountNode.textContent = String(words.length); resize(); animate(); addEventListener("resize", resize); reset();
})();
