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
## 日常维护流程

  1. 用 VS Code 打开 mywebsite 文件夹。
  2. 修改对应文件。
  3. 在项目目录运行：

  node server.js

  4. 浏览器访问 http://127.0.0.1:4173 检查效果。
  5. 修改完成后重新生成提交压缩包。

  ## 常用内容对应位置

  - 主页：OneDrive/Desktop/mywebsite/home.html
  - 个人介绍：OneDrive/Desktop/mywebsite/about.html
  - 成长规划：OneDrive/Desktop/mywebsite/roadmap.html
  - 项目展示：OneDrive/Desktop/mywebsite/projects.html
  - 联系方式：OneDrive/Desktop/mywebsite/contact.html
  - 全站样式：OneDrive/Desktop/mywebsite/css/styles.css
  - 头像：assets/avatar.jpg
  - 背景音乐：assets/music.mp3
  - 默认个人资料：OneDrive/Desktop/mywebsite/js/main.js
  - 单词游戏：OneDrive/Desktop/mywebsite/game/game.js

  ## 更换头像或音乐

  直接用新文件替换：

  - assets/avatar.jpg
  - assets/music.mp3

  保持文件名不变，就不需要修改代码。

  ## 修改个人资料

  网页右上角的 ID 可以修改资料，但这些内容只保存在当前浏览器，重新提交网站时不会永久生效。

  永久修改需要编辑 js/main.js 中的：

  name
  school
  major
  city
  email

  GitHub 地址则在 contact.html 中修改。

  ## 维护单词游戏

  - 永久修改默认词库：编辑 game/game.js 中的 DEFAULT_WORDS。
  - 网页里手动添加或导入的单词只保存在当前浏览器。
  - Excel 模板位于 game/单词导入模板.xlsx。
  - 不要删除 game/vendor/xlsx.full.min.js，否则 Excel 导入会失效。

  ## 重新打包提交

  在 mywebsite 的上一级目录执行：

  Compress-Archive -Path ".\mywebsite\*" -DestinationPath ".\个人网页最新版.zip" -Force

  提交前建议检查主页、音乐、所有导航链接、单词游戏和 Excel 导入。现有维护说明也可以查看 OneDrive/Desktop/mywebsite/
  README.md。
```text
