const fs = require("node:fs");
const path = require("node:path");
const src = path.basename(path.dirname(__dirname));

async function storeReader(storeName) {
  const storeContent = await fs.readFileSync(
    path.join(src, "store", `${storeName}.json`),
    "utf8"
  );

  return JSON.parse(storeContent);
}

async function storeWritter(storeName, newContent) {
  await fs.writeFileSync(
    path.join(src, "store", `${storeName}.json`),
    JSON.stringify(newContent, null, 2)
  );
}

module.exports = {
  storeReader,
  storeWritter,
};
