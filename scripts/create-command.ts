import fs from "node:fs";
import path from "node:path";
import { toKebab, toPascal } from "../src/common/utils/string.utils";
import { ensureDirectory, formatFiles, registerHandler } from "./utils/script-utils";
import { ROOT } from "./utils/scripts.constants";

const [rawName, ...descriptionParts] = process.argv.slice(2);
const name = toKebab(rawName || "");
if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error("Usage: npm run create:command -- <name> [description]");
const description = descriptionParts.join(" ") || `Runs the ${name} command`;
const className = `${toPascal(name)}Command`;
const directory = path.join(ROOT, "src/commands/handlers");
const file = path.join(directory, `${name}.command.ts`);
const moduleFile = path.join(ROOT, "src/commands/commands.module.ts");
if (fs.existsSync(file)) throw new Error(`${file} already exists`);
ensureDirectory(directory);
fs.writeFileSync(
  file,
  `import { Injectable } from "@nestjs/common";
import { Context, SlashCommand, type SlashCommandContext } from "necord";

@Injectable()
export class ${className} {
  @SlashCommand({ name: "${name}", description: ${JSON.stringify(description)} })
  async handle(@Context() [interaction]: SlashCommandContext) {
    await interaction.reply("TODO: implement ${name}");
  }
}
`,
);
registerHandler(moduleFile, `import { ${className} } from "./handlers/${name}.command";`, className);
void formatFiles([file, moduleFile]).then(() => {
  console.info(`Created src/commands/handlers/${name}.command.ts`);
});
