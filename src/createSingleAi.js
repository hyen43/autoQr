const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const path = require("path");
const axios = require("axios");
const fs = require("fs").promises;

const projectDir = process.env.PROJECT_DIR || __dirname;
const jsxPath = path.join(projectDir, "createQr.jsx");
const templatePath = path.join(projectDir, "templates", "template.ai");

async function createSingleAi(person) {
  console.log("person", person);
  const qr = person[0];
  const key = person[1];
  const code = person[2];

  console.log(`[${key}] 명함 생성 시작`);
  console.log(`Project Directory: ${projectDir}`);
  console.log(`JSX Path: ${jsxPath}`);
  console.log(`Template Path: ${templatePath}`);

  const tempDir = path.join(projectDir, "temp");
  const distDir = path.join(projectDir, "dist");

  try {
    // 디렉토리 생성 및 권한 확인
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(distDir, { recursive: true });
    await fs.chmod(tempDir, 0o755);
    await fs.chmod(distDir, 0o755);
    console.log(`[${key}] Temp directory: ${tempDir}`);
    console.log(`[${key}] Dist directory: ${distDir}`);

    // templates 폴더 존재 여부 확인
    const templatesDir = path.join(projectDir, "templates");
    try {
      await fs.access(templatesDir);
      console.log(`[${key}] Templates directory exists: ${templatesDir}`);
    } catch (error) {
      throw new Error(`Templates directory not found: ${templatesDir}`);
    }

    // 템플릿 파일 존재 여부 확인
    try {
      await fs.access(templatePath);
      console.log(`[${key}] Template file exists: ${templatePath}`);
    } catch (error) {
      throw new Error(
        `Template file not found: ${templatePath}. Please ensure the file exists in the templates folder.`
      );
    }

    const imagePath = path.join(tempDir, `${key}_qrcode.jpg`);
    let imageDownloaded = false;

    // URL 유효성 확인 및 이미지 다운로드
    try {
      console.log(`[${key}] Downloading image from: ${qr}`);
      const response = await axios({
        url: qr,
        method: "GET",
        responseType: "arraybuffer",
        timeout: 10000,
      });

      await fs.writeFile(imagePath, response.data);
      imageDownloaded = true;
      console.log(`[${key}] Image downloaded successfully: ${imagePath}`);
    } catch (error) {
      console.error(
        `[${key}] Failed to download image: ${qr}, Error: ${error.message}`
      );
      return {
        filePath: null,
        error: `Failed to download image: ${qr}, ${error.message}`,
      };
    }

    if (!imageDownloaded) {
      return {
        filePath: null,
        error: `Image download skipped for ${key}`,
      };
    }

    // Adobe Illustrator 스크립트 실행
    const command = `osascript -e 'tell application "Adobe Illustrator" to do javascript "#include \\"${jsxPath}\\"" with arguments {"${projectDir}", "${key}", "${code}", "${imagePath}"}'`;
    console.log(`[${key}] Executing AppleScript command: ${command}`);
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      throw new Error(`AppleScript error: ${stderr}`);
    }
    const filePath = stdout.trim();
    console.log(`[${key}] AppleScript output: ${filePath}`);

    // 결과 파일 확인
    try {
      await fs.access(filePath);
      console.log(`[${key}] Result file created: ${filePath}`);
    } catch (error) {
      throw new Error(`Result file not found: ${filePath}`);
    }

    console.log(`[${key}] 명함 생성 완료`);
    return {
      filePath: filePath,
    };
  } catch (error) {
    console.error(`[${key}] Error processing: ${error.message}`);
    return {
      filePath: null,
      error: error.message,
    };
  }
}

module.exports = createSingleAi;
