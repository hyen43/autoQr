// const runApplescript = require("run-applescript");
// const path = require("path");
// const jsxPath = path.resolve("./createNamecard.jsx");

// async function createSingleAi(person) {
//   var qr = person[0];
//   var key = person[1];
//   var code = person[2];

//   console.log(`${qr} 명함 생성 시작`);
//   var filePath = await runApplescript(
//     `tell application "Adobe Illustrator" to do javascript "#include ${jsxPath}" with arguments {"${path.dirname(
//       require.main.filename
//     )}", "${key}", "${code}", "${qr}"}`
//   );
//   console.log(`${qr} 명함 생성 완료`);
//   return {
//     filePath: filePath,
//   };
// }

// module.exports = createSingleAi;
const runApplescript = require("run-applescript");
const path = require("path");
const axios = require("axios");
const fs = require("fs").promises; // Promise 기반 fs 사용
const jsxPath = path.resolve("./createNamecard.jsx");

async function createSingleAi(person) {
  console.log("person", person);
  var qr = person[0]; // QR 코드 URL
  var key = person[1];
  var code = person[2];

  console.log(`${key} 명함 생성 시작`);

  // 임시 폴더 경로 설정
  const projectDir = path.dirname(require.main.filename);
  const tempDir = path.join(projectDir, "temp");
  try {
    // temp 폴더 생성
    await fs.mkdir(tempDir, { recursive: true });

    // 이미지 다운로드
    const imagePath = path.join(tempDir, `${key}_qrcode.jpg`);
    const response = await axios({
      url: qr, // QR 코드 URL
      method: "GET",
      responseType: "arraybuffer", // 바이너리 데이터로 받음
    });

    // 이미지 파일 저장
    await fs.writeFile(imagePath, response.data);

    // Illustrator 스크립트 실행
    const filePath = await runApplescript(
      `tell application "Adobe Illustrator" to do javascript "#include ${jsxPath}" with arguments {"${projectDir}", "${key}", "${code}", "${imagePath}"}`
    );

    console.log(`${key} 명함 생성 완료`);
    return {
      filePath: filePath,
    };
  } catch (error) {
    console.error(`Error processing ${key}:`, error.message);
    return {
      filePath: null,
      error: error.message,
    };
  }
}

module.exports = createSingleAi;
