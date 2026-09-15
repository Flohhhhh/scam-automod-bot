import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./utils/scripts.constants";

const groups = [
  { directory: "src/commands/handlers", module: "src/commands/commands.module.ts", suffix: ".command.ts" },
  { directory: "src/listeners/handlers", module: "src/listeners/listeners.module.ts", suffix: ".listener.ts" },
];
const errors: string[] = [];

for (const group of groups) {
  const directory = path.join(ROOT, group.directory);
  const moduleSource = fs.readFileSync(path.join(ROOT, group.module), "utf8");
  const files = fs.readdirSync(directory).filter((file) => file.endsWith(group.suffix));
  for (const file of files) {
    const source = fs.readFileSync(path.join(directory, file), "utf8");
    const className = source.match(/export class (\w+)/)?.[1];
    if (!className) errors.push(`${group.directory}/${file} has no exported class`);
    else if (!moduleSource.includes(className)) errors.push(`${className} is not registered in ${group.module}`);
    if (!/@(?:SlashCommand|Subcommand|On|Once)\(/.test(source)) {
      errors.push(`${group.directory}/${file} has no supported handler decorator`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.info("Handler validation passed.");
