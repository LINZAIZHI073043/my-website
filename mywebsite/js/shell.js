(() => {
  "use strict";
  const gate = document.querySelector("#entry-gate");
  const enter = document.querySelector("#enter-site");
  const audio = document.querySelector("#persistent-audio");
  const player = document.querySelector("#shell-player");
  const toggle = document.querySelector("#shell-audio-toggle");
  const frame = document.querySelector("#site-frame");

  audio.volume = 0.32;
  const sync = () => {
    const playing = !audio.paused;
    toggle.textContent = playing ? "Ⅱ" : "▶";
    toggle.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");
  };

  enter.addEventListener("click", async () => {
    enter.disabled = true;
    enter.querySelector("span").textContent = "正在建立连接…";
    try {
      await audio.play();
      gate.classList.add("connected");
      player.hidden = false;
      frame.focus();
    } catch {
      enter.disabled = false;
      enter.querySelector("span").textContent = "播放失败，请再次点击";
    }
    sync();
  });

  toggle.addEventListener("click", async () => {
    if (audio.paused) await audio.play(); else audio.pause();
    sync();
  });
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);

  const canvas = document.querySelector("#shell-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  function resize() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    particles = Array.from({ length:Math.min(110,Math.floor(innerWidth/12)) },() => ({x:Math.random()*innerWidth,y:Math.random()*innerHeight,v:.25+Math.random()*.8,c:Math.random()>.5?"1":"0"}));
  }
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height); ctx.font="12px Consolas";
    particles.forEach((p) => { ctx.fillStyle=Math.random()>.15?"rgba(53,242,255,.3)":"rgba(255,59,212,.35)";ctx.fillText(p.c,p.x,p.y);p.y+=p.v;if(p.y>innerHeight+12){p.y=-12;p.x=Math.random()*innerWidth;} });
    requestAnimationFrame(draw);
  }
  resize(); draw(); addEventListener("resize",resize);
})();
