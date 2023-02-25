import { spawn } from "node:child_process";
import { execsPath, modelsPath, outputPath } from "./paths";
import { getOutputPath } from "./utils";
import { join } from "path";

class execQueue {
  taskList: Array<{ isCompleted: boolean; input: string; progress: number }>;
  options: {
    upscaler: string;
    scale: string;
    model: string;
    parallelCount: number;
  };
  constructor(
    taskList: Array<{ isCompleted: boolean; input: string; progress: number }>,
    options: {
      upscaler: string;
      scale: string;
      model: string;
      parallelCount: number;
    }
  ) {
    this.taskList = taskList;
    this.options = options;
  }
  async excutor(
    input: string,
    callback: { (fileName: string, progress: number): void }
  ) {
    const task = await new Promise((resolve, reject) => {
      // console.log(`文件为:${input}开始处理...`);
      const output = getOutputPath(outputPath, this.options.model, input);
      const upscaler = this.options.upscaler;
      const exec = join(execsPath, this.options.upscaler);
      const scale = this.options.scale;
      const model = this.options.model;
      let isCompleted = true;
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
      sp.stderr.on("data", (data: Buffer) => {
        const d = data.toString();
        if (d.length > 0 && d.length < 10) {
          const progress = parseFloat(d.split("%")[0]);
          callback(input, progress);
        }
        if (d.includes("invalid gpu") || d.includes("failed")) {
          isCompleted = false;
        }
      });
      sp.on("exit", () => {
        resolve({ input, isCompleted });
      });
    });
    return task;
  }
  async run(
    callback: { (input: string, progress: number): void },
    isCompleted: { (fileName: string, isCompleted: boolean): void }
  ) {
    const pool: Array<Promise<unknown>> = [];
    const max = this.options.parallelCount ? this.options.parallelCount : 1;
    for (let i = 0; i < this.taskList.length; i++) {
      let promise = this.excutor(this.taskList[i].input, callback);
      promise.then((data: { input: string; isCompleted: boolean }) => {
        isCompleted(data.input, data.isCompleted);
        // console.log(`文件为:${result}已经处理完毕,当前并发为${pool.length}`);
        pool.splice(pool.indexOf(promise), 1);
      });
      pool.push(promise);
      if (pool.length == max) {
        await Promise.race(pool);
      }
    }
  }
}

export default execQueue;
