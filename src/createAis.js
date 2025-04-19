const createSingleAi = require("./createSingleAi");

async function createAis(persons) {
  var fileResults = [];
  for (i = 0; i < persons.length; i++) {
    var fileResult = await createSingleAi(persons[i]);
    fileResults.push(fileResult);
  }
  console.log(`모든 명함 생성 완료`);
  console.log("fileResult", fileResults);
}

module.exports = createAis;
