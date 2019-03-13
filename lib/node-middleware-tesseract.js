'use strict'

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const tempDirPath = require('os').tmpdir()
const { psms, oems, l } = require('./config')
const { throwErr, checkTesseractVersion } = require('./utils')

const defaultOptions = { l, psm: psms[3], oem: oems[3] }

const tesseract = function(image, options, callback) {
  checkTesseractVersion(function(flag) {
    if (!image) throwErr('can not find image')
    if (typeof options !== 'function' && typeof callback !== 'function') throwErr('callback is undefined')

    let imageUri = path.resolve(image)

    fs.access(imageUri, fs.constants.F_OK, function(err) {
      // not find image
      throwErr(err)
      let output = path.resolve(tempDirPath, `tesseract-temp-${new Date().getTime()}`)

      let command = ['tesseract', imageUri, output]

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      command = [
        ...command,
        options.l ? `-l ${options.l}` : `-l ${defaultOptions.l}`,
        options.oem && oems.indexOf(+options.oem) !== -1
          ? `--oem ${options.oem}`
          : (console.log('The oem you set is out of range or set err, use default.'), `--oem ${defaultOptions.oem}`),
        options.psm && psms.indexOf(+options.psm) !== -1
          ? `--psm ${options.psm}`
          : (console.log('The psm you set is out of range or set err, use default.'), `--psm ${defaultOptions.psm}`)
      ].join(' ')

      // console.log('command', command)

      exec(command, function(err) {
        // command err
        throwErr(err)
        let tempFileName = `${output}.txt`
        fs.readFile(tempFileName, 'utf-8', function(err, data) {
          // not find tempfile
          throwErr(err)
          fs.unlink(tempFileName, function(err) {
            // not find tempfile
            throwErr(err)
            callback(null, data)
          })
        })
      })
    })
  })
}

module.exports = tesseract
