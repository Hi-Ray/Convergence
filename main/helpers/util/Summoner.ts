import LCUEndpoints from "./Constants";

import Connector from "./Connector";

const getIGB = () => {
  return Connector()
    .get(LCUEndpoints.USER_BINDINGS)
    .then((res) => {
      return res;
    })
    .catch(() => {});
};

const getIGS = () => {
  return Connector()
    .get(LCUEndpoints.GAME_SETTINGS)
    .then((res) => {
      return res;
    });
};

const getSummonerName = () => {
  return Connector()
    .get(LCUEndpoints.CHAT_ME)
    .then((res) => {
      return `${res.gameName}#${res.gameTag}`;
    });
};

export { getIGB, getIGS, getSummonerName };
