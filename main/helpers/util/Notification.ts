import Connector from "./Connector";
import LCUEndpoints from "./Constants";

function notify(msg) {
  const json = {
    backgroundUrl:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Morgana_26.jpg",
    created: "2019-06-2T05:15:00",
    critical: true,
    data: {
      details: msg,
    },
    detailKey: "pre_translated_details",
    dismissible: true,
    expires: "2032-07-12T01:00:00",
    iconUrl: "",
    id: 0,
    source: "string",
    state: "string",
    titleKey: "string",
    type: "string",
  };

  Connector().post(LCUEndpoints.PLAYER_NOTIFICATION, json).catch(null);
}

export default notify;
