import path from "path";
import type { BrowserWindowConstructorOptions } from "electron";

const platform = process.platform;

export const windowConfig: BrowserWindowConstructorOptions = {
  width: 990,
  height: 650,
  frame: platform !== "win32",
  hasShadow: true,
  thickFrame: false,
  resizable: false,
  show: false,
  icon: path.join(__dirname, "..", "..", "/.vue/electron.ico"),
  webPreferences: {
    preload: path.join(__dirname, "..", "preload.js"),
    nodeIntegration: true,
    contextIsolation: false,
    nodeIntegrationInWorker: true,
  },
};
