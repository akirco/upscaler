import { join, dirname } from "node:path";
import { app } from "electron";
import { NODE_ENV } from "../main/config";

const rootPath = app.getAppPath();

let resourcesPath = "";

if (NODE_ENV === "development") {
  resourcesPath = join(process.cwd(), "resources");
} else {
  resourcesPath = dirname(rootPath);
}

export const rootDir = join(resourcesPath, "..");
export const execsPath = join(resourcesPath, "bin");
export const modelsPath = join(resourcesPath, "models");
