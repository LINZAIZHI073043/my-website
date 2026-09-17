这是一个用 HTML、CSS 和 JavaScript 制作的多页面个人网站，包含个人主页、关于我、大学四年规划、项目展示、联系方式和可玩的英语单词配对游戏。

## 使用方法

1. 双击 `index.html`，点击“连接并进入”即可启动音乐并浏览网站。
2. 推荐在本目录运行 `node server.js`，然后访问 `http://127.0.0.1:4173`。
3. 点击右上角 `ID`，可在浏览器中修改姓名、学校、专业、城市和邮箱；数据只保存在当前浏览器。

## 提交前修改

- 当前头像文件为 `assets/avatar.jpg`；如需再次替换，保持文件名不变即可。
- 确认个人介绍、技能熟练度、项目经历和联系方式真实准确。
- 背景音乐为 `I Really Want to Stay at Your House`，保存在 `assets/music.mp3`。
- 从项目展示页进入游戏，确认个人网站与游戏之间的链接正常。

## 目录结构

```text
个人网站/
├─ index.html
├─ home.html
├─ about.html
├─ roadmap.html
├─ projects.html
├─ contact.html
├─ assets/
│  ├─ avatar.jpg
│  └─ music.mp3
├─ css/styles.css
├─ css/shell.css
├─ js/main.js
├─ js/shell.js
└─ game/
   ├─ index.html
   ├─ game.css
   └─ game.js
```
