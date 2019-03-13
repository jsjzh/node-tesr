#!/usr/bin/env node

const argv = require('yargs').argv
const tesseract = require('./index')
const path = require('path')
const fs = require('fs')

// 图片来源
let from = argv.from
// 默认英文
let l = argv.l || 'eng'
// 默认自动识别
let psm = argv.p || 3
// 默认自动识别
let oem = argv.o || 3
// 是否将识别出来的文字导出
let to = argv.to

switch (l) {
  case 'chs':
    l = 'chi_sim'
    break
  case 'cht':
    l = 'chi_tra'
    break
}

tesseract(from, { l, psm, oem }, function(err, data) {
  if (err) throw new Error('read file error')
  console.log(data)
  if (to) {
    to = path.resolve(to)
    fs.writeFileSync(to, data, 'utf8', function(err) {
      if (err) throw new Error('put error')
    })
  }
})
