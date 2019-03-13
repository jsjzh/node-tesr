'use strict'

const versions = process.versions
const { exec } = require('child_process')

function checkTesseractVersion(callback) {
  exec('tesseract --version', function(err, stdout) {
    if (err) throw Error('Please check if you have installed tesseract-ORC && Set the environment variables correctly.')
    versions.tesseracts = stdout
      .toLowerCase()
      .split(/[\r,\n]/)
      .reduce((sum, item) => (item ? [...sum, item.trim()] : sum), [])
    versions.tesseract = versions.tesseracts[0].split(/[v,-]/)[1]
    callback(true)
  })
}

module.exports = checkTesseractVersion
