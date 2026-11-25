import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LABEL = "Warning: human has skimmed the documentation and is now confident.";

interface LabelFacts {
  label: string;
  characters: number;
  bytes: number;
  lines: number;
}

function labelFacts(text: string): LabelFacts {
  return {
    label: text,
    characters: Array.from(text).length,
    bytes: Buffer.byteLength(text, "utf8"),
    lines: text.split("\n").length,
  };
}

function fail(message: string): never {
  process.stderr.write(`entry invalid: ${message}\n`);
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const entryPath = join(outputDir, "entry.txt");

const facts = labelFacts(LABEL);

if (facts.characters < 1 || facts.characters > 200) {
  fail(`character count ${facts.characters} is outside 1..200`);
}

if (facts.bytes < 1 || facts.bytes > 200) {
  fail(`byte count ${facts.bytes} is outside 1..200`);
}

if (facts.label.trim().length === 0) {
  fail("the label is empty after trimming");
}

if (facts.label !== facts.label.trim()) {
  fail("the label has leading or trailing whitespace");
}

if (facts.lines !== 1) {
  fail(`the label must be a single line, found ${facts.lines} lines`);
}

const contents = Buffer.from(`${facts.label}\n`, "utf8");

mkdirSync(outputDir, { recursive: true });
writeFileSync(entryPath, contents);

const onDisk = readFileSync(entryPath);
if (!onDisk.equals(contents)) {
  fail(`entry.txt on disk (${onDisk.length} bytes) does not match the written bytes (${contents.length} bytes)`);
}

process.stdout.write(
  `path: ${entryPath}\ncharacters: ${facts.characters}\nbytes: ${facts.bytes}\n`,
);
