import { app } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import LCUConn from "./helpers/util/Connector";
import "./helpers/ipc";
import Store from "electron-store";
Store.initRenderer()
LCUConn().start();

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 400,
    height: 600,
    resizable: false,
    backgroundColor: "#18191B",
    title: "Convergence",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: __dirname + '/icon.ico'
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});
