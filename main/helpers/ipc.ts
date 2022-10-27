import { dialog } from "electron";
import { ipcMain as ipc } from "electron-better-ipc";
import LCUEndpoints from "./util/Constants";
import {
  exportConfigData,
  loadConfigFile,
  loadPrevConfig,
} from "./util/Config";
import Connector from "./util/Connector";
import { getIGB, getIGS, getSummonerName } from "./util/Summoner";

console.log("Registering IPC Listeners...");

Connector().on("connect", () => {
  console.log("ipc: connect");
  ipc.sendToRenderers("lcu-connected");
});

Connector().on("disconnect", () => {
  console.log("ipc: disconnect");
  ipc.sendToRenderers("lcu-disconnected");
});

ipc.answerRenderer("start-connector", () => {
  console.log("ipc: start-connector");
  Connector().start();
  return Connector().isConnected();
});

ipc.answerRenderer("is-lcu-ready", async () => {
  console.log("ipc: is-lcu-ready");
  const isReady = await Connector().isReady();
  return isReady;
});

ipc.answerRenderer("lol-current-summoner", () => {
  console.log("ipc: lol-current-summoner");
  if (Connector().isConnected()) {
    return Connector().get(LCUEndpoints.CHAT_ME);
  }

  return { gameName: "", gameTag: "" };
});

ipc.on("close-application", () => {
  console.log("ipc: close-application");
  process.exit(0);
});

ipc.answerRenderer("export-config", async () => {
  console.log("ipc: export-config");
  const fileLocation = dialog.showSaveDialogSync({ title: "Save Config" });

  if (fileLocation != null) {
    const IGS = await getIGS();
    const IGB = await getIGB();
    const summonerName = await getSummonerName();

    return exportConfigData(IGS, IGB, summonerName, fileLocation);
  }

  return null;
});

ipc.answerRenderer("import-config", async (path) => {
  console.log("ipc: import-config");
  return loadConfigFile(path as string);
});

ipc.answerRenderer("import-prev", () => {
  console.log("ipc: import-prev");
  return loadPrevConfig();
});

Connector().on("connect", () => ipc.sendToRenderers("lcu-connected"));
Connector().on("disconnect", () => ipc.sendToRenderers("lcu-disconnect"));
console.log("Done Loading IPC Listeners");
