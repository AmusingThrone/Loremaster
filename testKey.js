const config = require('dotenv').config()
const request = require('./util/request.js');
const fs = require('fs');
const path = require('path');
const api_key = process.env.CAPTCHA_API_KEY

async function getCaptcha() {
  const res = await request.get({
          uri: 'https://www.freekigames.com/Captcha?mode=ua',
          encoding: null,
          jar: request.jar()
        });
  const buffer = Buffer.from(res, 'utf8');
  fs.writeFileSync(
      path.join(__dirname, './captchas', `test.png`),
      buffer
  );
}

async function removeCaptcha() {
  try {
    fs.unlinkSync(
      path.join(__dirname, '../captchas', `test.png`)
    );
  } catch (error) {
    return Promise.reject(error);
  }
}

async function solveCaptcha() {
  const result = await request({
      method: 'POST',
      url: 'https://api.amusingthrone.com/wizard101/v2/captcha',
      formData: {
          key: api_key,
          img: fs.createReadStream(path.join(__dirname, './captchas', `test.png`)),
      },
  });

  const data = JSON.parse(result);
  if (data.error) {
      console.log("Error using key:", data.message);
  } else {
      console.log("This API Key is valid!")
  }
}

async function main() {
  await getCaptcha();
  await solveCaptcha();
}

if (config.error) {
  console.log(`ENV Error: Do you have a .env file? ${config.error}`);
} else if (!api_key) {
  console.log(`ENV Error: Have you set CAPTCHA_API_KEY variable in .env?`);
} else {
  main();
}