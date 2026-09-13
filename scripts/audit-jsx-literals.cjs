const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const out = path.join(__dirname, "audit-output");
const attributes = new Set(["placeholder", "title", "aria-label", "alt", "label"]);
const objectLabels = new Set(["title", "label", "desc", "description", "placeholder", "alt", "badge", "message"]);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(tsx|jsx)$/.test(file)) files.push(file);
  }
}
walk(src);
const rows = [];
const errors = [];
function group(file) {
  if (file.startsWith("src/app/admin/")) return "admin";
  if (file.startsWith("src/app/(auth)/")) return "auth";
  if (file.startsWith("src/app/(dashboard)/")) return "dashboard-routes";
  if (file.startsWith("src/app/test-settings/")) return "test-fixture";
  if (file.startsWith("src/app/")) return "public-and-root-routes";
  if (file.startsWith("src/lib/pdf/")) return "pdf";
  if (file.startsWith("src/components/")) return "components";
  return "other";
}
for (const fullPath of files.sort()) {
  const relative = path.relative(root, fullPath).split(path.sep).join("/");
  const code = fs.readFileSync(fullPath, "utf8");
  const source = ts.createSourceFile(relative, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const diagnostic of source.parseDiagnostics) errors.push({file: relative, message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")});
  const translators = new Set();
  function identify(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const expression = ts.isAwaitExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (ts.isCallExpression(expression) && /^(useTranslations|getTranslations|createTranslator)$/.test(expression.expression.getText(source))) translators.add(node.name.text);
    }
    ts.forEachChild(node, identify);
  }
  identify(source);
  const seen = new Set();
  function isTranslationCall(node) {
    if (!ts.isCallExpression(node)) return false;
    let target = node.expression;
    if (ts.isPropertyAccessExpression(target)) target = target.expression;
    return ts.isIdentifier(target) && translators.has(target.text);
  }
  function add(node, category, value, context) {
    if (!/\p{L}/u.test(value)) return;
    const pos = node.getStart(source);
    const key = `${pos}:${category}`;
    if (seen.has(key)) return;
    seen.add(key);
    const location = source.getLineAndCharacterOfPosition(pos);
    const technical = /^(?:Nota|Ku|NotaKu|PRO|FREE|IDR|USD|SGD|EUR|QRIS|CNAME|TXT|HTTP|API|OTP|PDF|ID|EN|Classic|Modern|Minimal|E-Wallet)$/.test(value.trim()) || /^(?:https?:\/\/|@|Authorization:|POST \/|GET \/|ntk_live_|whsec_)/.test(value.trim());
    rows.push({file: relative, line: location.line + 1, column: location.character + 1, group: group(relative), category, classification: technical ? "brand-or-protocol-review" : category === "object-label-candidate" ? "binding-review-needed" : "visible-literal-candidate", context, value});
  }
  // Follow only value-producing branches. Translation calls and their arguments are excluded.
  function values(node, category, context) {
    if (!node || isTranslationCall(node)) return;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) { add(node, category, node.text, context); return; }
    if (ts.isTemplateExpression(node)) {
      const value = node.head.text + node.templateSpans.map(span => "${" + span.expression.getText(source) + "}" + span.literal.text).join("");
      add(node, category, value, context);
      for (const span of node.templateSpans) values(span.expression, category, context);
      return;
    }
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node)) return values(node.expression, category, context);
    if (ts.isConditionalExpression(node)) { values(node.whenTrue, category, context); values(node.whenFalse, category, context); return; }
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.PlusToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(node.operatorToken.kind)) {
      if (node.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) values(node.left, category, context);
      values(node.right, category, context);
    }
  }
  function visit(node) {
    if (ts.isJsxText(node)) add(node, "jsx-text", node.text.replace(/\s+/g, " ").trim(), node.parent && node.parent.openingElement ? node.parent.openingElement.tagName.getText(source) : "fragment");
    if (ts.isJsxAttribute(node) && attributes.has(node.name.getText(source))) {
      values(ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer, "jsx-attribute", node.name.getText(source));
    }
    if (ts.isJsxExpression(node) && !ts.isJsxAttribute(node.parent)) values(node.expression, "jsx-expression", "rendered expression");
    if (ts.isPropertyAssignment(node) && objectLabels.has(node.name.getText(source).replace(/^["']|["']$/g, ""))) values(node.initializer, "object-label-candidate", node.name.getText(source));
    ts.forEachChild(node, visit);
  }
  visit(source);
}
rows.sort((a,b) => a.file.localeCompare(b.file) || a.line-b.line || a.column-b.column || a.category.localeCompare(b.category));
fs.mkdirSync(out, {recursive: true});
const header = [
  "SCAN_SCOPE=all .tsx/.jsx recursively under src/; generated not excluded",
  "METHOD=TypeScript AST JSX text, literal attributes and rendered expressions; supplementary object-label candidates",
  "LIMITS=static candidates, not language detection; brands/protocols may be legitimate; object bindings require review; imported strings, spreads, indirect function returns, non-JSX email strings and runtime DOM are not fully traced",
  "CLASSIFICATION=does not claim every candidate is untranslated product copy",
  `SCANNED_FILES=${files.length} PARSE_ERRORS=${errors.length} CANDIDATES=${rows.length}`
];
fs.writeFileSync(path.join(out, "jsx-literals.json"), JSON.stringify({scope: header, files: files.map(file=>path.relative(root,file).split(path.sep).join("/")), errors, rows}, null, 2));
fs.writeFileSync(path.join(out, "jsx-literals.txt"), header.join("\n") + "\n\n" + rows.map(row => `${row.file}:${row.line}:${row.column} [${row.category}; ${row.classification}; ${row.context}] ${JSON.stringify(row.value)}`).join("\n") + "\n");
console.log(header.join("\n"));
for (const field of ["group", "category", "classification"]) {
  console.log(`=== BY ${field.toUpperCase()} ===`);
  const counts = {};
  for (const row of rows) counts[row[field]] = (counts[row[field]] || 0) + 1;
  for (const [name,count] of Object.entries(counts).sort()) console.log(`${name}: ${count}`);
}
console.log("=== BY FILE ===");
for (const file of [...new Set(rows.map(row=>row.file))]) console.log(`${file}: ${rows.filter(row=>row.file===file).length}`);
console.log("FULL_REPORT=scripts/audit-output/jsx-literals.txt");
if (errors.length) { console.error(JSON.stringify(errors)); process.exitCode = 1; }
