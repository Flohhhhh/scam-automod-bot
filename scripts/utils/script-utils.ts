import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";
import { ROOT } from "./scripts.constants";

export const ensureDirectory = (directory: string) => fs.mkdirSync(directory, { recursive: true });

export async function formatFiles(files: string[]) {
  const config = await prettier.resolveConfig(path.join(ROOT, ".prettierrc"));
  for (const file of files) {
    const source = await fs.promises.readFile(file, "utf8");
    const formatted = await prettier.format(source, { ...config, filepath: file });
    await fs.promises.writeFile(file, formatted);
  }
}

export function registerHandler(modulePath: string, importStatement: string, className: string) {
  let source = fs.readFileSync(modulePath, "utf8");
  if (!source.includes(importStatement)) source = `${importStatement}\n${source}`;
  source = source.replace(
    /const HANDLERS: Provider\[\] = \[([^\]]*)\];/,
    (_match, entries: string) =>
      `const HANDLERS: Provider[] = [${entries.trim() ? `${entries.trim()}, ` : ""}${className}];`,
  );
  fs.writeFileSync(modulePath, source);
}
