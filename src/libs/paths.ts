import { join, dirname } from "node:path";
import { app } from "electron";
import { NODE_ENV } from "../main/config";

let resourcesPath = "";

if (NODE_ENV === "development") {
  resourcesPath = join(process.cwd(), "resources");
} else {
  const rootPath = app.getAppPath();
  resourcesPath = dirname(rootPath);
}

export const rootDir = join(resourcesPath, "..");
export const execsPath = join(resourcesPath, "bin");
export const modelsPath = join(resourcesPath, "models");
export const outputPath = join(resourcesPath, "..", "images");
