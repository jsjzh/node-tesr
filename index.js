'use strict';

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const tempDirPath = require('os').tmpdir();

let versionInfo = "";
let version = "";

// Page segmentation modes:
// 0 --- Orientation and script detection (OSD) only.
// 1 --- Automatic page segmentation with OSD.
// 2 --- Automatic page segmentation, but no OSD, or OCR.
// 3 --- Fully automatic page segmentation, but no OSD. (Default)
// 4 --- Assume a single column of text of variable sizes.
// 5 --- Assume a single uniform block of vertically aligned text.
// 6 --- Assume a single uniform block of text.
// 7 --- Treat the image as a single text line.
// 8 --- Treat the image as a single word.
// 9 --- Treat the image as a single word in a circle.
// 10 --- Treat the image as a single character.
// 11 --- Sparse text. Find as much text as possible in no particular order.
// 12 --- Sparse text with OSD.
// 13 --- Raw line. Treat the image as a single text line, bypassing hacks that are Tesseract-specific.
const psms = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// OCR Engine modes:
// 0 --- Legacy engine only.
// 1 --- Neural nets LSTM engine only.
// 2 --- Legacy + LSTM engines.
// 3 --- Default, based on what is available.
const oems = [0, 1, 2, 3];

const defaultOptions = {
  l: "eng",
  psm: psms[3],
  oem: oems[3]
}

function checkTesseractVersion(callback) {
  exec("tesseract --version", function(err, stdout) {
    if (err) {
      console.log("Please check if you have installed tesseract-ORC && Set the environment variables correctly.");
      callback(err, null);
      return;
    }
    versionInfo = stdout.toLowerCase().split(/[\r,\n]/).reduce((sum, item) => (item ? [...sum, item.trim()] : sum), []);
    version = versionInfo[0].split(/[v,-]/)[1];
    console.log(`tesseract version: ${version}`);
    callback(null);
  })
}

const tesseract = function(image, options = {}, callback) {
  checkTesseractVersion(function(err) {
    // not find tesseract-ORC
    if (err) throw err;
    let imageUri = path.resolve(image);
    fs.access(imageUri, fs.constants.F_OK, function(err) {
      // not find image
      if (err) throw err;
      let output = path.resolve(tempDirPath, `tesseract-temp-${new Date().getTime()}`);

      let command = ["tesseract", imageUri, output];

      command = [...command,
        options.l ? `-l ${options.l}` : `-l ${defaultOptions.l}`,
        options.oem && oems.indexOf(+options.oem) !== -1 ? `--oem ${options.oem}` : (console.log("The OEM you set is out of range."), `--oem ${defaultOptions.oem}`),
        options.psm && psms.indexOf(+options.psm) !== -1 ? `--psm ${options.psm}` : (console.log("The PSM you set is out of range."), `--psm ${defaultOptions.psm}`)
      ].join(" ");

      console.log(command);

      exec(command, function(err) {
        if (err) throw err;
        let tempFileName = `${output}.txt`;
        fs.readFile(tempFileName, "utf-8", function(err, data) {
          if (err) throw err;
          fs.unlink(tempFileName, function(err) {
            if (err) throw err;
            callback(null, data);
          });
        });
      })

    })
  })
}

tesseract("./test/output.jpg", {
  oem: 3,
  psm: 4
}, function(err, data) {
  if (err) console.log(err)
  console.log(data);
})

module.exports = tesseract;