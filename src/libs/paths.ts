import { join, dirname } from "node:path";
import { app } from "electron";
import isDev from "electron-is-dev";
import { rootPath } from "electron-root-path";

const rootDirectory = app.getAppPath();
let resources = "";
if (isDev) {
  resources = join(rootPath, "resources");
  console.log(resources);
} else {
  resources = dirname(rootDirectory);
  console.log(resources);
}
export const rootDir = rootPath;
export const execsPath = join(resources, "bin");
export const modelsPath = join(resources, "models");
