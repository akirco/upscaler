import { spawn } from "child_process";
export async function run(command: string, args: string[]) {
  const upscaler = spawn(command, args, {
    cwd: undefined,
    detached: false,
  });
  return upscaler;
}
