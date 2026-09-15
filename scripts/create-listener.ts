import fs from "node:fs";
import path from "node:path";
import { Events } from "discord.js";
import { toKebab, toPascal } from "../src/common/utils/string.utils";
import { ensureDirectory, formatFiles, registerHandler } from "./utils/script-utils";
import { ROOT } from "./utils/scripts.constants";

const [rawName, requestedEvent] = process.argv.slice(2);
const name = toKebab(rawName || "");
const eventEntry = Object.entries(Events).find(([key, value]) => key === requestedEvent || value === requestedEvent);
if (!/^[a-z][a-z0-9-]*$/.test(name) || !eventEntry) {
  throw new Error("Usage: npm run create:listener -- <name> <Discord event name>");
}
const [eventKey] = eventEntry;
const className = `${toPascal(name)}Listener`;
const directory = path.join(ROOT, "src/listeners/handlers");
const file = path.join(directory, `${name}.listener.ts`);
const moduleFile = path.join(ROOT, "src/listeners/listeners.module.ts");
if (fs.existsSync(file)) throw new Error(`${file} already exists`);
ensureDirectory(directory);
fs.writeFileSync(
  file,
  `import { Injectable } from "@nestjs/common";
import { Events } from "discord.js";
import { Context, type ContextOf, On } from "necord";

@Injectable()
export class ${className} {
  @On(Events.${eventKey})
  handle(@Context() context: ContextOf<Events.${eventKey}>) {
    void context;
    // TODO: implement ${eventKey}
  }
}
`,
);
registerHandler(moduleFile, `import { ${className} } from "./handlers/${name}.listener";`, className);
void formatFiles([file, moduleFile]).then(() => {
  console.info(`Created src/listeners/handlers/${name}.listener.ts`);
});
