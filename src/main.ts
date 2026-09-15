import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { EnvService } from "./env/env.service";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const env = app.get(EnvService);
  await app.listen(env.get("PORT"), "0.0.0.0");
}

void bootstrap().catch((error: unknown) => {
  console.error("Failed to bootstrap the application:", error);
  process.exitCode = 1;
});

const processLogger = new Logger("process");
process.on("unhandledRejection", (error) => processLogger.error("Unhandled rejection", error));
process.on("uncaughtException", (error) => processLogger.error("Uncaught exception", error));
