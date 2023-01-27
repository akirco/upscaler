import { app, BrowserWindow, session } from "electron";
import InitWindow from "./app/createWindow";
import { DEV_TOOLS_ISOPEN } from "./config";
import { registerProtocol } from "./app/fileProtocol";

async function loadDevtools() {
  const { VUEJS3_DEVTOOLS } = require("electron-devtools-vendor");
  await session.defaultSession.loadExtension(VUEJS3_DEVTOOLS, {
    allowFileAccess: true,
  });
  console.log("install vue-devtools sucess!");
}

async function appReady() {
  if (DEV_TOOLS_ISOPEN()) await loadDevtools();
  await registerProtocol();
  await new InitWindow().createWindow();
  if (process.platform === "win32") {
    app.commandLine.appendSwitch("high-dpi-support", "true");
    app.commandLine.appendSwitch("force-device-scale-factor", "1");
  }
}

app.whenReady().then(appReady);

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) await appReady();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
