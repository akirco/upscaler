import { BrowserWindow, Menu } from "electron";
import { toggleDark, windowAction, upscaleHandler } from "./ipcMain";
import { windowConfig } from "./config";
import { registerShortcut } from "./shortcut";
import { fsmkdir } from "./fsmkdir";

const NODE_ENV = process.env.NODE_ENV;

class InitWindow {
  public mainWindow: BrowserWindow = new BrowserWindow(windowConfig);
  async createWindow() {
    windowAction(this.mainWindow);
    upscaleHandler(this.mainWindow);
    registerShortcut(this.mainWindow);
    toggleDark();
    fsmkdir();
    this.mainWindow.webContents.on("dom-ready", () => {
      this.mainWindow.removeMenu();
      Menu.setApplicationMenu(Menu.buildFromTemplate([]));
    });
    this.mainWindow.once("ready-to-show", async () => {
      this.mainWindow.show();
    });

    if (NODE_ENV === "development") {
      await this.mainWindow.loadURL("http://localhost:3000/");
      this.mainWindow.webContents.openDevTools();
    } else {
      await this.mainWindow.loadFile("dist/.vue/index.html");
    }
  }
}

export default InitWindow;
