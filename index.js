const { createReadStream } = require("fs");
const csv = require("fast-csv");
const createAis = require("./src/createAis");

async function main() {
  const csvPath = process.env.CSV_PATH || "test.csv";
  const projectDir = process.env.PROJECT_DIR || __dirname;

  process.env.PROJECT_DIR = projectDir;
  console.log(`CSV Path: ${csvPath}`);
  console.log(`Project Directory: ${projectDir}`);

  const persons = [];
  const stream = createReadStream(csvPath);

  stream
    .pipe(csv.parse({ headers: false }))
    .on("data", (data) => {
      persons.push(data);
      console.log(`Read row: ${data}`);
    })
    .on("end", async () => {
      try {
        console.log(`Total rows read: ${persons.length}`);
        const results = await createAis(persons);
        const successCount = results.filter((r) => r.filePath).length;
        const errorCount = results.filter((r) => r.error).length;

        const message =
          `명함 생성 완료: ${successCount}개 성공, ${errorCount}개 실패. dist 폴더를 확인하세요.\n` +
          results
            .map(
              (r, i) =>
                `Row ${i + 1}: ${
                  r.error ? "실패 - " + r.error : "성공 - " + r.filePath
                }`
            )
            .join("\n");
        process.send(message);
      } catch (error) {
        process.send(`에러: ${error.message}`);
      }
    })
    .on("error", (error) => {
      process.send(`CSV 파일을 읽는 중 오류가 발생했습니다: ${error.message}`);
    });
}

main();
