(() => {
  "use strict";

  const defaults = {
    name: "林载贽",
    school: "华中科技大学",
    major: "金融学",
    city: "武汉",
    email: "saddm72hdf@gmail.com"
  };
  const profileKey = "nova-profile-v4";

  function getProfile() {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(profileKey) || "{}") }; }
    catch { return { ...defaults }; }
  }

  function applyProfile() {
    const profile = getProfile();
    document.querySelectorAll("[data-profile]").forEach((node) => {
      const key = node.dataset.profile;
      if (profile[key]) node.textContent = profile[key];
    });
    if (document.body.dataset.page === "home") {
      document.title = `${profile.name} | 未来工程师`;
    }
  }

  function ensureDialog() {
    if (document.querySelector("#profile-dialog")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="profile-dialog" id="profile-dialog">
        <form method="dialog" class="dialog-inner" id="profile-form">
          <div class="dialog-head"><h2>编辑身份信息</h2><button class="icon-btn" value="cancel" aria-label="关闭">×</button></div>
          <p class="section-desc">信息仅保存在当前浏览器，不会上传。</p>
          <div class="form-grid">
            <div class="field"><label for="pf-name">姓名</label><input id="pf-name" name="name" required></div>
            <div class="field"><label for="pf-school">学校</label><input id="pf-school" name="school"></div>
            <div class="field"><label for="pf-major">专业</label><input id="pf-major" name="major"></div>
            <div class="field"><label for="pf-city">城市</label><input id="pf-city" name="city"></div>
            <div class="field full"><label for="pf-email">邮箱</label><input id="pf-email" name="email" type="email"></div>
          </div>
          <div class="dialog-actions"><button class="btn secondary small" type="button" data-reset-profile>恢复默认</button><button class="btn small" value="default">保存</button></div>
        </form>
      </dialog>`);
  }

  function bindProfileEditor() {
    ensureDialog();
    const dialog = document.querySelector("#profile-dialog");
    const form = document.querySelector("#profile-form");
    document.querySelectorAll(".edit-profile").forEach((button) => button.addEventListener("click", () => {
      const profile = getProfile();
      Object.entries(profile).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
      dialog.showModal();
    }));
    form.addEventListener("submit", (event) => {
      const submitter = event.submitter;
      if (submitter?.value === "cancel") return;
      const data = Object.fromEntries(new FormData(form));
      localStorage.setItem(profileKey, JSON.stringify(data));
      applyProfile();
    });
    form.querySelector("[data-reset-profile]").addEventListener("click", () => {
      localStorage.removeItem(profileKey);
      Object.entries(defaults).forEach(([key, value]) => { form.elements[key].value = value; });
      applyProfile();
    });
  }

  function bindNavigation() {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "☰";
    });
    links.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    });
  }

  function bindAudio() {
    const audio = document.querySelector("#bg-audio");
    const button = document.querySelector(".audio-toggle");
    if (!audio || !button) return;
    if (window.self !== window.top) {
      document.querySelector(".audio-dock")?.remove();
      audio.remove();
      return;
    }
    audio.volume = 0.32;
    audio.autoplay = true;
    const sync = () => {
      const playing = !audio.paused;
      button.textContent = playing ? "Ⅱ" : "▶";
      button.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");
      button.style.color = playing ? "var(--pink)" : "var(--cyan)";
    };
    button.addEventListener("click", async () => {
      try {
        if (audio.paused) await audio.play(); else audio.pause();
      } catch (error) {
        console.warn("浏览器阻止了音频播放：", error);
      }
      sync();
    });
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);
    sync();
    const attemptAutoplay = async () => {
      try {
        await audio.play();
      } catch {
        button.title = "浏览器已阻止自动播放，点击页面任意位置后将开始播放";
        const unlock = async () => {
          try { await audio.play(); } catch { /* 仍可使用播放按钮 */ }
          removeEventListener("pointerdown", unlock);
          removeEventListener("keydown", unlock);
        };
        addEventListener("pointerdown", unlock, { once: true });
        addEventListener("keydown", unlock, { once: true });
      }
    };
    attemptAutoplay();
  }

  function bindTyping() {
    const target = document.querySelector("[data-typing]");
    if (!target || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (target) target.textContent = target.dataset.typing.split("|")[0];
      return;
    }
    const phrases = target.dataset.typing.split("|");
    let p = 0, i = 0, reverse = false;
    const tick = () => {
      const phrase = phrases[p];
      target.textContent = `> ${phrase.slice(0, i)}${i % 2 ? "_" : "▌"}`;
      if (!reverse && i < phrase.length) i += 1;
      else if (!reverse) { reverse = true; setTimeout(tick, 1100); return; }
      else if (i > 0) i -= 1;
      else { reverse = false; p = (p + 1) % phrases.length; }
      setTimeout(tick, reverse ? 34 : 72);
    };
    tick();
  }

  function bindReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { nodes.forEach((n) => n.classList.add("visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    nodes.forEach((node) => observer.observe(node));
  }

  function bindTimeline() {
    document.querySelectorAll(".timeline-item .panel").forEach((panel) => {
      const toggle = () => {
        const item = panel.closest(".timeline-item");
        const open = item.classList.toggle("open");
        panel.setAttribute("aria-expanded", String(open));
      };
      panel.addEventListener("click", toggle);
      panel.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
      });
    });
  }

  function bindTilt() {
    const card = document.querySelector("[data-tilt]");
    if (!card || matchMedia("(pointer: coarse)").matches) return;
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  }

  function bindContactForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = document.querySelector("#form-status");
      const name = new FormData(form).get("name");
      status.textContent = `本地模拟完成：已收到 ${name} 的消息。没有任何数据被上传。`;
      status.style.color = "var(--cyan)";
      form.reset();
    });
  }

  function bindClockAndCursor() {
    const clock = document.querySelector("[data-clock]");
    if (clock) {
      const update = () => { clock.textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false }); };
      update(); setInterval(update, 1000);
    }
    const glow = document.querySelector(".cursor-glow");
    if (glow && !matchMedia("(pointer: coarse)").matches) {
      addEventListener("pointermove", (event) => { glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; });
    }
  }

  function startMatrix() {
    const canvas = document.querySelector("#matrix-canvas");
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    let width, height, particles;
    const reset = () => {
      const scale = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight;
      canvas.width = width * scale; canvas.height = height * scale;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      particles = Array.from({ length: Math.min(90, Math.floor(width / 15)) }, () => ({
        x: Math.random() * width, y: Math.random() * height, speed: .18 + Math.random() * .55,
        char: Math.random() > .5 ? "1" : "0", alpha: .12 + Math.random() * .35
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = "12px Consolas";
      particles.forEach((p) => {
        ctx.fillStyle = `rgba(53,242,255,${p.alpha})`;
        ctx.fillText(p.char, p.x, p.y);
        p.y += p.speed;
        if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width; }
      });
      requestAnimationFrame(draw);
    };
    reset(); draw(); addEventListener("resize", reset);
  }

  document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
  applyProfile();
  bindProfileEditor();
  bindNavigation();
  bindAudio();
  bindTyping();
  bindReveal();
  bindTimeline();
  bindTilt();
  bindContactForm();
  bindClockAndCursor();
  startMatrix();
})();
