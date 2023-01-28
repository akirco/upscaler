import { globalShortcut, shell } from "electron";
import type { BrowserWindow } from "electron";
import { rootDir } from "../../libs/paths";
import { join } from "path";

export function registerShortcut(mainWindow: BrowserWindow) {
  globalShortcut.register("Control+Shift+I", async () => {
    await shell.openPath(join(rootDir, "images"));
  });
}
