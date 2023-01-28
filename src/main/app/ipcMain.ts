import { ipcMain, nativeTheme, dialog } from "electron";
import type { BrowserWindow } from "electron";
import os from "node:os";
import { channels } from "../../libs/channels";
import { commands } from "../../libs/commands";
import { run } from "../../libs/exec";
import { execsPath, modelsPath } from "../../libs/paths";

function windowAction(mainWindow: BrowserWindow) {
  // 窗口事件
  ipcMain.on("windowMinSize", () => {
    mainWindow.minimize();
  });
  ipcMain.on("toggleSize", (event) => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on("windowClosed", () => {
    mainWindow.close();
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("isMaxed", "false");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("isMaxed", "true");
  });
}

function toggleDark() {
  ipcMain.handle("dark-mode:toggle", () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = "light";
    } else {
      nativeTheme.themeSource = "dark";
    }
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle("dark-mode:system", () => {
    nativeTheme.themeSource = "system";
  });
}

function upscaleHandler(mainWindow: BrowserWindow) {
  //* 选择图片
  ipcMain.handle(channels.selectInput, async (event, message) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: `图片`, extensions: ["jpg", "png"] }],
      defaultPath: os.homedir(),
    });
    if (canceled) {
      return "cancelled";
    } else {
      return filePaths[0];
    }
  });
  //* start enhance
  ipcMain.on(channels.startEhanced, async (event, args) => {
    const { upscaler, scale, model, input, output } = args;
    let params = null;
    if (upscaler === "realesrgan-ncnn-vulkan") {
      params = [
        "-i",
        input,
        "-o",
        output,
        "-s",
        scale,
        "-m",
        modelsPath,
        "-n",
        model,
      ];
    } else {
      params = [
        "-i",
        input,
        "-o",
        output,
        "-s",
        scale,
        "-x",
        "-m",
        modelsPath + "\\" + model,
      ];
    }
    const upscaleHero = await run(execsPath + "\\" + upscaler, params);
    upscaleHero.stderr.on("data", (data) => {
      data = data.toString();

      mainWindow.webContents.send(commands.upscale, data);

      if (data.includes("invalid gpu") || data.includes("failed")) {
        mainWindow.webContents.send(commands.failed);
      }
      if (data.includes("has alpha channel")) {
      }
    });
    upscaleHero.stderr.on("close", () => {
      mainWindow.webContents.send(commands.done);
    });
  });

  // // * 选择目录
  // ipcMain.handle(channels.selectFolder, async () => {
  //   const { canceled, filePaths } = await dialog.showOpenDialog({
  //     properties: ["openDirectory"],
  //   });
  //   if (canceled) {
  //     console.log("operation cancelled");
  //     return "cancelled";
  //   } else {
  //     return filePaths[0];
  //   }
  // });

  // // * set image path
  // ipcMain.on(channels.setInputPath, (_, args: string) => {
  //   const ext = args.substring(args.lastIndexOf("."), args.length);
  //   if (ext === ".jpg" || ext === ".png") {
  //     console.log("setImagePath:", args);
  //   } else {
  //     return;
  //   }
  // });

  // //* setOutputPath
  // ipcMain.on(channels.setOutputPath, (_, args) => {
  //   console.log(args);
  // });

  // //* setModel
  // ipcMain.on(channels.setUpscaleModel, (_, args) => {
  //   console.log(args);
  // });
}

export { windowAction, toggleDark, upscaleHandler };
