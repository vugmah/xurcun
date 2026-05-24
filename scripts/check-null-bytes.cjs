/**
 * Prebuild check: fail if any source file contains null bytes.
 * Usage: node scripts/check-null-bytes.cjs
 */
const fs = require("fs");
const path = require("path");

function scanDir(dir, exts, results) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "dist" && entry.name !== ".git") {
        scanDir(fullPath, exts, results);
      }
    } else if (entry.isFile() && exts.some((e) => entry.name.endsWith(e))) {
      results.push(fullPath);
    }
  }
}

const files = [];
scanDir("src", [".ts", ".tsx"], files);
scanDir("api", [".ts"], files);

let bad = 0;
for (const f of files) {
  const buf = fs.readFileSync(f);
  let count = 0;
  for (let i = 0; i < buf.length; i++) if (buf[i] === 0) count++;
  if (count > 0) {
    console.log("NULL BYTE: " + f + " (" + count + " null bytes)");
    bad++;
  }
}

if (bad > 0) {
  console.error(
    "\nERROR: " + bad + " file(s) have null bytes.\n" +
    "Fix: find src api -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) " +
    "-exec python3 -c \"import sys;f=open(sys.argv[1],'rb').read();" +
    "open(sys.argv[1],'wb').write(f.replace(bytes([0]),b''))\" {} +"
  );
  process.exit(1);
}

console.log("\u2713 No null bytes in " + files.length + " source files");
