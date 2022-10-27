import { EventEmitter } from "events";
import https from "https";
import Connector from "lcu-connector";
import Axios, { AxiosInstance } from "axios";

const connector = new Connector();

const Prt = null;

let connectionActive = false;

const reqAgent = new https.Agent({
  rejectUnauthorized: false,
});

const requestURL = `https://127.0.0.1:${Prt}`;

class LCUConnector extends EventEmitter {
  private connected: boolean;

  private connector: any;

  private password: string;

  private request: AxiosInstance;

  private port: number;

  private reqConfig: any;

  constructor(props?) {
    super(props);

    this.connector = connector;
    this.connected = false;

    this.reqConfig = {
      httpsAgent: reqAgent,
      headers: {
        Authorization: `Basic ${Buffer.from(`riot:${this.password}`).toString(
          "base64"
        )}`,
      },
    };

    connector.on("connect", ({ password, port }) => {
      console.log("Connection established to the LCU");
      this.connected = true;

      this.password = password;
      this.port = port;

      connectionActive = true;

      this.request = Axios.create({
        baseURL: requestURL,
        timeout: 1000,
        headers: {
          Authorization: `Basic ${Buffer.from(`riot:${password}`).toString(
            "base64"
          )}`,
        },
        httpsAgent: reqAgent,
      });

      this.emit("connect", { port, password });
    });

    connector.on("disconnect", () => {
      this.connected = false;

      this.password = null;
      this.port = null;

      this.emit("disconnect");
    });
  }

  isConnected() {
    return this.connected;
  }

  start() {
    if (!connectionActive) {
      console.log("Starting the connector...");
      this.connector.start();
    }
  }

  stop() {
    if (connectionActive) {
      this.connector.stop();
    }
  }

  async isReady() {
    const res = await this.get("lol-summoner/v1/current-summoner");

    console.log(`IS READY?: ${JSON.stringify(res)}`);

    return res != null;
  }

  async get(url) {
    console.log("Initiating GET request to LCU");

    const res = await Axios.get(
      `https://riot:${this.password}@127.0.0.1:${this.port}/${url}`,
      this.reqConfig
    );

    if (res.status !== 200) {
      return null;
    }

    return res.data;
  }

  put(url, data) {
    if (this.connected) {
      return Axios.put(
        `https://riot:${this.password}@127.0.0.1:${this.port}/${url}`,
        data,
        this.reqConfig
      )
        .then((res) => {
          return res;
        })

        .catch(() => {});
    }
  }

  patch(url, data) {
    if (this.connected) {
      return Axios.patch(
        `https://riot:${this.password}@127.0.0.1:${this.port}/${url}`,
        data,
        this.reqConfig
      )
        .then((res) => {
          return res.data;
        })
        .catch(() => {});
    }
  }

  delete(url) {
    if (this.connected) {
      return Axios.delete(
        `https://riot:${this.password}@127.0.0.1:${this.port}/${url}`,
        this.reqConfig
      ).catch(() => {});
    }
  }

  post(url, data) {
    if (this.connected) {
      return Axios.post(
        `https://riot:${this.password}@127.0.0.1:${this.port}/${url}`,
        data,
        this.reqConfig
      )
        .then((res) => {
          return res.data;
        })
        .catch();
    }
  }
}

const conn = new LCUConnector();

function LCUConn() {
  return conn;
}

export default LCUConn;
