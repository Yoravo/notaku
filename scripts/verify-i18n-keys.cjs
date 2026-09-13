const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (locale) => JSON.parse(fs.readFileSync(path.join(root, "src/messages", `${locale}.json`), "utf8"));
const id = read("id");
const en = read("en");
const kind = (value) => value === null ? "null" : Array.isArray(value) ? "array" : typeof value;

// Record every node, including containers, empty objects and each array index.
function tree(value, prefix = "$", result = {}) {
  const type = kind(value);
  result[prefix] = type === "array" ? `array(length=${value.length})` : type;
  if (type === "object" || type === "array") {
    for (const key of Object.keys(value).sort()) {
      tree(value[key], type === "array" ? `${prefix}[${key}]` : `${prefix}.${key}`, result);
    }
  }
  return result;
}

function differences(left, right) {
  const missingInEn = Object.keys(left).filter((key) => !Object.hasOwn(right, key));
  const missingInId = Object.keys(right).filter((key) => !Object.hasOwn(left, key));
  const typeOrLengthMismatch = Object.keys(left)
    .filter((key) => Object.hasOwn(right, key) && left[key] !== right[key])
    .map((key) => ({key, id: left[key], en: right[key]}));
  return {missingInEn, missingInId, typeOrLengthMismatch};
}

const idTree = tree(id);
const enTree = tree(en);
const diff = differences(idTree, enTree);
const leafCount = (value) => Object.values(tree(value)).filter((type) => !type.startsWith("array(") && type !== "object").length;
console.log("INPUT_ID=src/messages/id.json");
console.log("INPUT_EN=src/messages/en.json");
console.log("CHECK=all paths + value types + array lengths; NOT translation meaning/value equality");
console.log(`ID_NODES=${Object.keys(idTree).length} ID_LEAVES=${leafCount(id)}`);
console.log(`EN_NODES=${Object.keys(enTree).length} EN_LEAVES=${leafCount(en)}`);
console.log("MISSING_IN_EN=" + JSON.stringify(diff.missingInEn));
console.log("MISSING_IN_ID=" + JSON.stringify(diff.missingInId));
console.log("TYPE_OR_LENGTH_MISMATCH=" + JSON.stringify(diff.typeOrLengthMismatch));

for (const namespace of [...new Set([...Object.keys(id), ...Object.keys(en)])].sort()) {
  const left = tree(id[namespace]);
  const right = tree(en[namespace]);
  try {
    assert.deepStrictEqual(left, right);
    console.log(`[PASS] ${namespace} ID_LEAVES=${leafCount(id[namespace])} EN_LEAVES=${leafCount(en[namespace])}`);
  } catch {
    console.log(`[FAIL] ${namespace} ` + JSON.stringify(differences(left, right)));
  }
}

// Negative control: prove a missing q inside an array is detected.
const control = structuredClone(en);
assert.ok(Array.isArray(control.faq.items) && control.faq.items.length > 0);
delete control.faq.items[0].q;
assert.ok(differences(idTree, tree(control)).missingInEn.includes("$.faq.items[0].q"));
console.log("[PASS] NEGATIVE_CONTROL detects missing $.faq.items[0].q");
try {
  assert.deepStrictEqual(idTree, enTree);
  console.log("RESULT=PASS");
} catch {
  console.log("RESULT=FAIL");
  process.exitCode = 1;
}
