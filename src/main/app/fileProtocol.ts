import path from "path";
import { protocol } from "electron";

export async function registerProtocol() {
  protocol.registerFileProtocol("images", (request, callback) => {
    const url = request.url.substring(7);
    callback(decodeURI(path.normalize(url)));
  });
}
