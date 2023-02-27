import { join, resolve } from "node:path";
import { Worker } from "node:worker_threads";

const workerPath = resolve(
  join(__dirname, "../libs/worker/index.js").replace(/\\/g, "/")
);

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
      const worker = new Worker(workerPath, {
        workerData: {
          input,
          options: this.options,
        },
      });
      worker.on("message", (data) => {
        if (data.progress) {
          callback(input, data.progress);
        }
        if (data.isCompleted) {
          resolve({ input, isCompleted: true });
        }
      });
      worker.on("error", (err) => {
        reject(err);
      });
    });
    return task;
  }
  async run(
    callback: { (input: string, progress: number): void },
    isCompleted: { (fileName: string, isCompleted: boolean): void }
  ) {
    const max = this.options.parallelCount ? this.options.parallelCount : 1;
    const pool: Array<Promise<unknown>> = new Array(max);
    let i = 0;
    const queue = this.taskList.slice();
    while (queue.length > 0) {
      const task = queue.shift();
      const job = this.excutor(task.input, callback);
      pool[i] = job;
      i = (i + 1) % max;
      if (i === 0) {
        await Promise.race(pool);
      }
      job.then((data: { input: string; isCompleted: boolean }) => {
        isCompleted(data.input, data.isCompleted);
      });
    }
    await Promise.all(pool);
  }
}

export default execQueue;
