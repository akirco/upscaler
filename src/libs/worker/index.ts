import { parentPort, workerData } from "node:worker_threads";
import { spawn } from "node:child_process";
import { execsPath, modelsPath, outputPath } from "../paths";
import { getOutputPath } from "../utils";
import { join } from "path";

const { input, options } = workerData;

const { upscaler, scale, model } = options;
let isCompleted = true;

const output = getOutputPath(outputPath, model, input);

const exec = join(execsPath, upscaler);
let args = [];

if (upscaler === "realesrgan-ncnn-vulkan") {
  args = [
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
  args = [
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

const sp = spawn(exec, args);

sp.stderr.on("data", (data) => {
  const info = data.toString();
  if (info.length > 0 && info.length < 10) {
    const progress = parseFloat(info.split("%")[0]);
    parentPort.postMessage({ progress });
  }
  if (info.includes("invalid gpu") || info.includes("failed")) {
    isCompleted = false;
  }
});

sp.on("exit", () => {
  parentPort.postMessage({ isCompleted });
});
