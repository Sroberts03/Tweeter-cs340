// ts-jest AST transformer: Jest runs code as CommonJS, where Vite's
// `import.meta.env` is a syntax error. This replaces `import.meta` with an
// object literal `{ env: { ...values from tweeter-web/.env } }`.
// It uses ts-jest's own TypeScript instance so SyntaxKind values match.
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return env;
}

const env = loadEnv();

module.exports = {
  name: "import-meta-env",
  version: "1",
  factory(tsCompiler) {
    const ts = tsCompiler.configSet.compilerModule;
    const f = ts.factory;
    const envObject = () =>
      f.createObjectLiteralExpression(
        Object.entries(env).map(([k, v]) =>
          f.createPropertyAssignment(f.createStringLiteral(k), f.createStringLiteral(v)),
        ),
      );

    return (ctx) => (sourceFile) => {
      const visit = (node) =>
        ts.isMetaProperty(node) &&
        node.keywordToken === ts.SyntaxKind.ImportKeyword &&
        node.name.text === "meta"
          ? f.createObjectLiteralExpression([
              f.createPropertyAssignment("env", envObject()),
            ])
          : ts.visitEachChild(node, visit, ctx);
      return ts.visitNode(sourceFile, visit);
    };
  },
};
