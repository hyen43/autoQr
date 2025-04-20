const createSingleAi = require("./createSingleAi");

async function createAis(persons) {
  const fileResults = [];
  for (let i = 0; i < persons.length; i++) {
    console.log(`Processing row ${i + 1}/${persons.length}`);
    const result = await createSingleAi(persons[i]);
    fileResults.push(result);

    if (result.error) {
      console.log(`Row ${i + 1} failed: ${result.error}`);
    } else {
      console.log(`Row ${i + 1} succeeded: ${result.filePath}`);
    }
  }
  console.log(`All rows processed`);
  console.log("fileResults", fileResults);
  return fileResults;
}

module.exports = createAis;
