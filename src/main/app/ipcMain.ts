import { ipcMain, nativeTheme, dialog, shell } from "electron";
import type { BrowserWindow } from "electron";
import os from "node:os";
import showNotifications from "./notification";
import { channels } from "../../libs/channels";
import { commands } from "../../libs/commands";
import { run } from "../../libs/exec";
import { execsPath, modelsPath } from "../../libs/paths";
import Queue from "../../libs/queue_worker";
import { walkDir, WalkDirOptions } from "../../libs/walkDir";

function windowAction(mainWindow: BrowserWindow) {
  ipcMain.on("windowMinSize", () => {
    mainWindow.minimize();
  });
  ipcMain.on("toggleSize", (_event) => {
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
  //* select single image
  ipcMain.handle(channels.selectInput, async (_event, _message) => {
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
  //* startSingleTask
  ipcMain.on(channels.startSingleTask, async (_event, args) => {
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
      if (data.length > 0 && data.length < 10) {
        const num = parseFloat(data.split("%")[0]);
        mainWindow.setProgressBar(num);
      }
      mainWindow.webContents.send(commands.upscale, data);
      if (data.includes("invalid gpu") || data.includes("failed")) {
        mainWindow.webContents.send(commands.failed);
      }
      if (data.includes("has alpha channel")) {
      }
    });
    upscaleHero.stderr.on("close", () => {
      mainWindow.setProgressBar(-1);
      mainWindow.webContents.send(commands.done);
      showNotifications("Upscaler Notice", "Task is all completed!");
    });
  });
  ipcMain.on(commands.reload, () => {
    mainWindow.reload();
  });
  ipcMain.on(commands.openExternalGithub, (_, data) => {
    shell.openExternal(data);
  });
  ipcMain.on(channels.startParallelTasks, async (_, args) => {
    const { upscaler, scale, model, parallelCount, paralllelTasks } = args;
    const queue = new Queue(paralllelTasks, {
      upscaler,
      scale,
      model,
      parallelCount,
    });
    await queue.run(
      (input, progress) => {
        const data = {
          isCompleted: false,
          input,
          progress,
        };
        mainWindow.setProgressBar(progress);
        mainWindow.webContents.send(commands.parallel, data);
      },
      (input, isCompleted) => {
        const data = {
          isCompleted,
          input,
          progress: 100,
        };
        mainWindow.setProgressBar(-1);
        mainWindow.webContents.send(commands.parallelDone, data);
      }
    );
    showNotifications("Upscaler Notice", "Tasks is all completed!");
    mainWindow.webContents.send(commands.ok);
  });

  ipcMain.handle(channels.selectFolder, async () => {
    const options: WalkDirOptions = {
      extensions: [".png", ".jpg"],
      maxDepth: 10,
    };
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (canceled) {
      return "cancelled";
    } else {
      const files = await walkDir(filePaths[0], options);
      return files;
    }
  });
}

export { windowAction, toggleDark, upscaleHandler };
