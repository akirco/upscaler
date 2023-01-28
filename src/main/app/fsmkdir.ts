import fs from "fs";
import { rootDir } from "../../libs/paths";
import { join } from "path";

export function fsmkdir() {
  const directory = join(rootDir, "images");
  // console.log(directory);
  if (fs.existsSync(directory)) {
    return;
  } else {
    fs.mkdir(directory, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }
}
