# 锚盒 Pinbox

娃娃屋家具透视校准器。把透视不对的 AI 家具图钉上锚点，扭成 25° 轴测，按每格 63px 导出 PNG + JSON，可直接放进游戏。

## 下载到电脑

打开仓库页，点绿色 **Code → Download ZIP**：

https://github.com/harveyhaha123/pinbox

或直接下这个压缩包（用系统浏览器打开，不要用预览窗）：

https://github.com/harveyhaha123/pinbox/archive/refs/heads/main.zip

## 运行

需要 [Node.js 20+](https://nodejs.org/)

```bash
unzip pinbox-main.zip
cd pinbox-main
npm install
npm run dev
```

浏览器打开终端里显示的地址（一般是 http://localhost:5173）。

## 用法

1. 把家具图拖进页面，或点虚线框后 Ctrl+V
2. 微调锚点（蓝=正面，绿=侧面，橙=底面）
3. 「看房间效果」检查透视
4. 「导出游戏素材 PNG + JSON」——25°、每格 63px

刷新会自动恢复上次的图和锚点。
