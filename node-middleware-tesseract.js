#!/usr/bin/env node
const argv = require('yargs').argv
const tesseract = require('./index')

const path = argv.path
const l = argv.l || 'eng'
const psm = argv.p || 3
const oem = argv.o || 3

tesseract(path, { l, psm, oem }, function(err, data) {
  if (err) throw new Error('error')
  console.log(data)
})
