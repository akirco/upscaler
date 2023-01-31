import { join } from "path";
import { walker } from "./walker";
import { execsPath, modelsPath, outputPath } from "./paths";
import { runMulti } from "./exec";
import { getOutputPath } from "./utils";

export const parallelTasks = async (
  upscaler: string,
  inputPath: string,
  scale: string,
  model: string
) => {
  const cmd = join(execsPath, upscaler);
  const inputFile = await walker(inputPath, {
    wanted: [".jpg", ".png"],
  });
  for (const input of inputFile!) {
    const output = getOutputPath(outputPath, model, input);
    const child = runMulti(cmd, [
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
    ]);
    child.stdout.on("data", function (data) {
      console.log("stdout: " + data);
    });
    child.stderr.on("data", function (data) {
      console.log(child.pid, "stderr: " + data);
    });
    child.on("exit", function (code, signal) {
      console.log("exit: " + code, signal);
    });
  }
};
