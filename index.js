'use strict';

// tesseract

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

function checkTesseractVersion() {
  return new Promise((resolve, reject) => {
    exec("tesseract --version", function(err, stdout) {
      if (err) {
        console.log("pleace checkout yours tesseract-ORC is install && system path is right");
        reject(err);
        return;
      }
      versionInfo = stdout.toLowerCase().split(/[\r,\n]/).reduce((sum, item) => (item ? [...sum, item.trim()] : sum), []);
      version = versionInfo[0].split(/[v,-]/)[1];
      resolve(true);
    })
  })
}

function checkFileIsExist(file) {
  return fs.accessSync(file, fs.constants.F_OK)
}

const tesseract = function(image, options = {}) {
  return new Promise((resolve, reject) => {
    checkTesseractVersion().then(res => {
      let imageUri = path.resolve(image);

      if (!checkFileIsExist(imageUri)) {
        let output = path.resolve(tempDirPath, `tesseract-temp-${new Date().getTime()}`);

        let commands = ["tesseract", imageUri, output];
        let command = "";

        options.l ? commands.push(`-l ${options.l}`) : commands.push(`-l ${defaultOptions.l}`);

        if (options.oem) {
          if (oems.indexOf(+options.oem) === -1) {
            reject("oem err");
            return;
          } else {
            commands.push(`--oem ${options.oem}`)
          }
        } else {
          commands.push(`--oem ${defaultOptions.oem}`)
        }

        if (options.psm) {
          if (psms.indexOf(+options.psm) === -1) {
            reject("psm err");
            return;
          } else {
            commands.push(`--psm ${options.psm}`)
          }
        } else {
          commands.push(`--psm ${defaultOptions.psm}`)
        }

        command = commands.join(" ");

        exec(command, function(err) {
          if (err) {
            reject(err);
            return;
          } else {
            let file = `${output}.txt`;
            fs.readFile(file, "utf-8", function(err, data) {
              if (err) {
                reject(err);
                return;
              } else {
                fs.unlink(file, function(err) {
                  if (err) {
                    reject(err);
                    return;
                  } else {
                    resolve(data);
                    return;
                  }
                });
              }
            });
          }
        })

      } else {
        reject("not find file");
        return;
      }
    }).catch(err => {
      reject(err);
    });
  })
}

tesseract("./test/output.jpg").then(res => {
  console.log(res);
}).catch(err => {
  console.log(err);
})

// c:\Users\King\Desktop\SELF\code\node\output.jpg
// C:\Users\King\AppData\Local\Temp\node-tesseract-eda28151-cc91-4717-a706-99942755fcfd

module.exports = tesseract;