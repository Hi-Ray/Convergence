import React, {useEffect, useState} from "react";
import {ipcRenderer as ipc} from "electron-better-ipc";
import {shell} from "electron";
import dragDrop from "drag-drop";
import Styles from "../stylesheets/home.module.sass";
import Store from 'electron-store'
function Home() {
  const [isConnected, setIsConnected] = useState<true | false>(false);
  const [summoner, setSummoner] = useState<string>("");
  const [currentSummoner, setCurrentSummoner] = useState<string>("")

  const onGithubClick = () => {
    shell.openExternal("https://github.com/Hi-Ray/Convergence").catch(null);
  };

  const onExportClick = () => {
    ipc.callMain("export-config").catch(null);
  };

  const onPreviousClick = () => {
    ipc.callMain("import-prev").catch(null);
  };

  useEffect(() => {
    const store = new Store();
    const existingConfig = store.get('name') as string

    setSummoner(existingConfig)

    ipc
    .callMain("is-lcu-ready", null)
    .then((isReady: boolean) => setIsConnected(isReady));

    ipc
    .callMain("lol-current-summoner")
    .then((data: any) => {
      setCurrentSummoner(`${data.gameName}#${data.gameTag}`)
    });

    ipc.on("lcu-connected", () => {
      setIsConnected(true);
    });

    ipc.on("lcu-disconnected", () => {
      setIsConnected(false);
    });

    const drop = dragDrop("#droppable", (files, pos, fileList, directories) => {
      ipc.callMain("import-config", files[0].path).catch(null);
    });

    // Clean up any listeners
    return () => {
      console.log("cleaning up");
      ipc.removeAllListeners("lcu-connected");
      ipc.removeAllListeners("lcu-disconnected");
      drop();
    };
  }, []);

  const onClose = () => ipc.send("close-application");

  return (
      <>
        <img className={Styles.bg} src="/images/bg.jpg" alt="background"/>

        <div className={Styles.titlebar}>
          <button className={Styles.close} onClick={() => onClose()}/>
          .
        </div>

        <div
            className={Styles.indicator}
            style={{background: isConnected ? "#03FC9D" : "crimson"}}
        />
        <div className={Styles.droparea} id={"droppable"}>

          <img src={"/images/drop.webp"} className={Styles.drop} draggable={false} alt={"Drop here"}/>

          <button
              onClick={() => onPreviousClick()}
              className={Styles.previousconfig}
          >
            Load previous config
            <div className={Styles.smaller}>
              {summoner}
            </div>
          </button>

          <button onClick={() => onExportClick()} className={Styles.export}>
            Export Current Config
            <div className={Styles.smaller}>
              {currentSummoner}
            </div>
          </button>
        </div>

        <a className={Styles.flare} onClick={() => onGithubClick()}>
          <img src="/images/github.png" alt="Github" draggable={false}/>
        </a>
      </>
  );
}

export default Home;
