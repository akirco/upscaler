import { spawn } from "node:child_process";
import { execsPath, modelsPath, outputPath } from "./paths";
import { getOutputPath } from "./utils";
import { join } from "path";

class execQueue {
  taskList: Array<string>;
  completeList: Array<string>;
  options: {
    upscaler: string;
    scale: string;
    model: string;
    parallelCount: number;
  };
  progress: number[];
  constructor(
    taskList: Array<string>,
    options: {
      upscaler: string;
      scale: string;
      model: string;
      parallelCount: number;
    }
  ) {
    this.taskList = taskList;
    this.completeList = [];
    this.progress = [];
    this.options = options;
  }
  async excutor(input: string, callback: any) {
    const task = await new Promise((resolve, reject) => {
      // console.log(`文件为:${input}开始处理...`);
      const output = getOutputPath(outputPath, this.options.model, input);
      const exec = join(execsPath, this.options.upscaler);
      const scale = this.options.scale;
      const model = this.options.model;
      const sp = spawn(exec, [
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
      sp.stderr.on("data", (data: Buffer) => {
        const d = data.toString();
        if (d.length > 0 && d.length < 10) {
          const num = parseFloat(d.split("%")[0]);
          callback(input, num);
        }
      });
      sp.on("exit", () => {
        resolve(input);
      });
    });
    return task;
  }
  async run(callback: any) {
    const pool: any = [];
    const tasks = this.taskList;
    const max = this.options.parallelCount ? this.options.parallelCount : 1;
    for (let i = 0; i < tasks.length; i++) {
      let promise = this.excutor(tasks[i], callback);
      promise.then((result: string) => {
        // console.log(`文件为:${result}已经处理完毕,当前并发为${pool.length}`);
        this.completeList.push(result);
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
