import { exec } from "node:child_process";

export const isRunBackground = (name: string, cb: { (pid: string): void }) => {
  exec("tasklist", (err, stdout, stderr) => {
    if (err) {
      process.exit();
    } else {
      stdout.split("\n").filter((line) => {
        const processMessage = line.trim().split(/\s+/);
        const pname = processMessage[0];
        const pid = processMessage[1];
        if (pname.includes(name)) {
          return cb(pid);
        }
      });
    }
  });
};
