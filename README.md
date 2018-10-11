# node-middleware-tesseract

## 说明

配合 tesseract-OCR 食用的 node 中间件，支持 tesseract-OCR 最新的版本（v4.0.0-rc2.20181008）。

使用该中间件前，请确保电脑中已经安装了 tesseract-OCR，并且在环境变量中配置好了对应的 path。

### tesseract 下载地址（必要）
[tesseract 下载地址](https://github.com/tesseract-ocr/tesseract/wiki/Downloads "tesseract 下载")

[安装教程](https://jingyan.baidu.com/article/219f4bf788addfde442d38fe.html "安装教程")

### tessdata 下载地址（可选择所需的语言包下载）

[tessdata 下载地址](https://github.com/tesseract-ocr/tessdata "语言包下载")

语言包下载完成之后，将下载好的 `.traineddata` 文件放入 `...\Program Files (x86)\Tesseract-OCR\tessdata` 内即可。

## 使用

install
```
npm install node-middleware-tesseract
```

```javascript
const tesseract = require("node-middleware-tesseract");

tesseract("./output.png", {
  // 若要使用其他请务必先下载对应的语言包并放置正确位置
  l: "eng",
  oem: 3,
  psm: 3
}, function(err, data) {
  if (err) throw err;
  // 输出识别的文字
  console.log(data);
})
```