import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const HEALTHY_LIMIT = 250;
const REVIEW_LIMIT = 400;
const SPLIT_LIMIT = 500;
const roots = ["src", "scripts"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mjs"]);

function listFiles() {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", ...roots], {
    encoding: "utf8",
  })
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => extensions.has(file.slice(file.lastIndexOf("."))));
}

const files = listFiles();
const entries = files
  .map((file) => ({
    file,
    lines: readFileSync(file, "utf8").split(/\r?\n/).length,
    chars: readFileSync(file, "utf8").length,
  }))
  .sort((a, b) => b.lines - a.lines);

const splitRecommended = entries.filter((entry) => entry.lines > SPLIT_LIMIT);
const splitLikely = entries.filter((entry) => entry.lines > REVIEW_LIMIT && entry.lines <= SPLIT_LIMIT);
const reviewNeeded = entries.filter((entry) => entry.lines > HEALTHY_LIMIT && entry.lines <= REVIEW_LIMIT);

console.log(`Frontend file-size audit: ${files.length} files.`);
console.log(`  <= ${HEALTHY_LIMIT}: normal, no action by size alone.`);
console.log(`  ${HEALTHY_LIMIT + 1}-${REVIEW_LIMIT}: review for mixed UI, API, mapping, validation, or orchestration.`);
console.log(`  ${REVIEW_LIMIT + 1}-${SPLIT_LIMIT}: usually split unless cohesion is clear.`);
console.log(`  > ${SPLIT_LIMIT}: avoid without an explicit reason.`);

function printGroup(title, group) {
  if (group.length === 0) {
    console.log(`\n${title}: none`);
    return;
  }
  console.log(`\n${title}:`);
  for (const entry of group) {
    console.log(`${entry.lines.toString().padStart(4)} lines ${entry.chars.toString().padStart(6)} chars  ${entry.file}`);
  }
}

printGroup(`> ${SPLIT_LIMIT} split recommended`, splitRecommended);
printGroup(`${REVIEW_LIMIT + 1}-${SPLIT_LIMIT} split likely`, splitLikely);
printGroup(`${HEALTHY_LIMIT + 1}-${REVIEW_LIMIT} review needed`, reviewNeeded);
