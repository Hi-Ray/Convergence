import { readFileSync, writeFile } from "fs";
import Connector from "./Connector";

import Store from "electron-store";

import LCUEndpoints from "./Constants";

import notify from "./Notification";

const store = new Store();

/**
 * @param fileLocation - Self Explanatory
 */
const isValidConfig = (fileLocation: string) => {
  const contents = readFileSync(fileLocation).toString("utf8");
  try {
    return Object.prototype.hasOwnProperty.call(
      JSON.parse(contents),
      "convergenceConfigVersion"
    );
  } catch (e) {
    console.log("Config is not valid: ignoring...");
    return false;
  }
};

/**
 *
 * @param IGB - In Game Bindings
 * @param IGS In Game Settings
 * @param profileName - Self explanitory
 */
const loadConfig = async (IGB: string, IGS: string, profileName: string) => {
  await Connector().patch(LCUEndpoints.USER_BINDINGS, IGB);
  await Connector().patch(LCUEndpoints.GAME_SETTINGS, IGS);

  await Connector().post(LCUEndpoints.SAVE_SETTINGS, "");

  store.set("name", profileName);
  store.set("IGB", IGB);
  store.set("IGS", IGS);

  notify("Successfully imported ingame settings and bindings.");
};

const loadPrevConfig = async () => {
  const profileName = store.get("name") as string;
  const IGB = store.get("IGB") as string;
  const IGS = store.get("IGS") as string;
  console.log('Loading previous config')
  return loadConfig(IGB, IGS, profileName)
    .then(() => {
      console.log('Successfully loaded previous config')
      return true;
    })
    .catch(() => {
      console.log('Failed trying to load previous config')
      return false;
    });
};

/**
 *
 * @param fileLocation - Self Explanatory
 */
const loadConfigFile = async (fileLocation: string) => {
  if (await isValidConfig(fileLocation)) {
    const file = readFileSync(fileLocation).toString("utf8");

    const { IGB, IGS, name } = JSON.parse(file);
    store.set('name', name)
    store.set('IGB', IGB)
    store.set('IGS', IGS)
    return loadConfig(IGB, IGS, name)
      .then(() => {
        console.log('successfully loaded config file')
        return true;
      })
      .catch(() => {
        console.log('failed loading config file')
        return false;
      });
  }
  return false;
};

/**
 * @param IGS - In Game Settings
 * @param IGB - In Game Bindings
 * @param ProfileName - Self Explanatory
 * @param fileLocation - Self Explanatory
 */
const exportConfigData = async (IGS, IGB, ProfileName, fileLocation) => {
  const schema = {
    name: ProfileName,
    convergenceConfigVersion: "2.0.0",
    IGB,
    IGS,
  };
  try {
    writeFile(fileLocation, JSON.stringify(schema), {}, () => {});
    notify("Successfully exported ingame settings and bindings.");
    return true;
  } catch (e) {
    return false;
  }
};

export { exportConfigData, loadPrevConfig, loadConfigFile };
