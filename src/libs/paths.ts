import { join, dirname } from "node:path";
import { app } from "electron";

const rootPath = app.getAppPath();

const resources = dirname(rootPath);

export const rootDir = rootPath;
export const execsPath = join(resources, "bin");
export const modelsPath = join(resources, "models");
