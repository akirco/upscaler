export {};

declare global {
  interface Window {
    showFrame: boolean;
    ipcRenderer: Electron.IpcRenderer;
    rootdir: string;
  }
}
