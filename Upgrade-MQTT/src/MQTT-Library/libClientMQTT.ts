import mqtt, {
  ErrorWithReasonCode,
  IClientPublishOptions,
  IClientSubscribeOptions,
  MqttClient,
} from "mqtt";

//PayLoad Type for Message
export type ObjPayLoads = {
  sender: string;
  receiver: [acc: "PUBLIC" | "PRIVATE", id?: string];
  topic: string;
  topics?: string[];
  message: string | Buffer;
};

//Client Type for Ping-ACK
export type ClientsProperties = {
  sender: string;
  neighbor: string | undefined;
  topic: string;
  status: "ALIVE" | "DEAD" | undefined;
  ping: "ACK" | "RES" | undefined;
};

export default class ClientMQTT {
  private brokerURL: string;
  private client: MqttClient | null;
  private clientId: string;
  get getClientId() {
    return this.clientId;
  }
  private subscribedTopics: string[];
  get getSubTopics() {
    return this.subscribedTopics;
  }
  private manyClients: ClientsProperties[];
  get getManyClients() {
    return this.manyClients;
  }
  set setManyClients(x: string) {
    for (let i: number = 0; i < this.manyClients.length; i++) {
      if (
        this.manyClients[i].ping === "ACK" ||
        this.manyClients[i].ping === undefined
      ) {
        this.manyClients[i].status = "DEAD";
      }
    }
    console.log("halo");
  }
  set setClientACK(x: "ACK" | undefined) {
    for (let i: number = 0; i < this.manyClients.length; i++) {
      this.manyClients[i].ping = x;
    }
  }

  //Contructor: Initialized
  constructor(brokerURL: string) {
    this.brokerURL = brokerURL;
    this.client = null;
    this.clientId = `mqtt_${Math.random().toString(10).slice(2, 5)}`; // Sesuaikan dengan kebutuhan
    this.subscribedTopics = [];
    this.manyClients = [];
  }

  //Method to connect to broker based on broker URL
  private callbackConnectSuccess = () => {
    console.log(`Connected to Broker, ${this.clientId}`);
  };

  private callbackConnectFailed = (err: mqtt.ErrorWithReasonCode | Error) => {
    console.log(`Connection Failed ${err.message}`);
    throw new Error("Connection Failed");
  };

  connect(): boolean {
    this.client = mqtt.connect(this.brokerURL, { clientId: this.clientId });

    //Check if the client establish connection with broker failed or not
    try {
      this.client.on("connect", this.callbackConnectSuccess);

      //Error, can not connect to broker
      this.client.on("error", this.callbackConnectFailed);
      return true;
    } catch (e) {
      //Catch the error
      this.client = null;
      return false;
    }
  }

  //Method to subscribe to one topic or more
  private optionSubscribe: IClientSubscribeOptions = {
    qos: 1,
  };

  subscribe(topics: string[]) {
    for (let i: number = 0; i < topics.length; i++) {
      if (this.findTopic(topics[i]) === -1) {
        this.client!.subscribe(topics[i], this.optionSubscribe, (err) => {
          if (err) {
            console.log(`Can not Subscribed to topic ${topics[i]}`);
          } else {
            this.subscribedTopics.push(topics[i]);
            console.log(`Subscribed to topic ${topics[i]}`);
          }
        });
      } else {
        console.log(`Already Subscribed to topic ${topics[i]}`);
      }
    }
  }

  //Method to unsubscribe to one topic or more
  unsubscribe(topics: string[]) {
    for (let i: number = 0; i < topics.length; i++) {
      if (this.findTopic(topics[i]) !== -1) {
        this.client!.unsubscribe(topics[i], (err) => {
          if (err) {
            console.log(err);
          } else {
            this.deleteTopic(this.findTopic(topics[i]));
            console.log(`Unsubscribed to topic ${topics[i]} Successfully`);
          }
        });
      } else {
        console.log(`Topic ${topics[i]} doesn't exist`);
      }
    }
  }

  //Method to find topic from arrayTopics
  private findTopic(topic: string): number {
    const res = this.subscribedTopics.indexOf(topic);
    return res;
  }
  //Method to delete topic
  private deleteTopic(index: number) {
    delete this.subscribedTopics[index];
    this.subscribedTopics.sort();
    this.subscribedTopics.pop();
  }

  //Method to send message to one topic
  private optionPublish: IClientPublishOptions = {
    qos: 1,
    retain: false,
  };

  sendUniCast(obj: ObjPayLoads) {
    this.client!.publish(
      obj.topic,
      JSON.stringify(obj),
      this.optionPublish,
      (err) => {
        if (err) {
          console.log(
            `Failed to send message: ${obj.message}, topic: ${obj.topic}`,
          );
        } else {
          console.log(
            `Successfully send message: ${obj.message}, topic: ${obj.topic},`,
          );
        }
      },
    );
  }

  //Method to send message to one or more topic
  sendMultiCast(obj: ObjPayLoads) {
    for (let i: number = 0; i < obj.topics!.length; i++) {
      const objInput: ObjPayLoads = {
        sender: obj.sender,
        receiver: ["PUBLIC"],
        message: obj.message,
        topic: obj.topic,
      };
      this.sendUniCast(objInput);
    }
  }

  //Method to listen incomming message from subcribed topics
  private callbackOnMessage = (topic: string, message: Buffer): void => {
    console.log(`Topic: ${topic}, Message: ${message}`);
  };

  private callbackClientProperties = (obj: ClientsProperties): void => {
    switch (obj.ping) {
      case "ACK":
        if (obj.neighbor === this.clientId && obj.sender !== this.clientId) {
          obj.status = "ALIVE";
          obj.ping = "RES";
          this.sendPinkACK(obj);
        }
        if (obj.neighbor === undefined && obj.sender !== this.clientId) {
          obj.neighbor = this.clientId;
          obj.status = "ALIVE";
          obj.ping = "RES";
          this.sendPinkACK(obj);
        }
        break;
      case "RES":
        if (obj.sender === this.clientId) {
          if (this.manyClients.length === 0) {
            this.manyClients.push(obj);
            break;
          }
          for (let i: number = 0; i < this.manyClients.length; i++) {
            if (obj.neighbor === this.manyClients[i].neighbor) {
              this.manyClients[i] = obj;
              continue;
            }
            if (this.manyClients.length - 1 === i) {
              this.manyClients.push(obj);
              break;
            }
          }
          //console.log(`Client ${obj.neighbor} status: ${obj.status}`);
        }
        break;
      default:
        console.log("Error callbackClientProperties");
        break;
    }
  };

  private callbackObjPayLoads = (obj: ObjPayLoads) => {
    switch (obj.receiver[0]) {
      case "PUBLIC":
        console.log(
          `From: ${obj.sender}, Topic: ${obj.topic}, Message: ${obj.message}`,
        );
        break;
      case "PRIVATE":
        if (obj.receiver[1] === this.clientId) {
          console.log(
            `From: ${obj.sender}, Topic: ${obj.topic}, Message: ${obj.message}`,
          );
        }
        break;
      default:
        console.log("Error callbackObjPayLoads");
        break;
    }
  };

  onMessage(
    callbackClientProperties: (x: ClientsProperties) => any =
      this.callbackClientProperties,
    callbackObjPayLoads: (x: ObjPayLoads) => any = this.callbackObjPayLoads,
  ) {
    this.client!.on("message", (topic: string, message: Buffer) => {
      const obj: ClientsProperties | ObjPayLoads = JSON.parse(
        message.toString(),
      );
      if ("status" in obj || "neighbor" in obj || "ping" in obj) {
        //console.log("callbackClientProperties(obj);");
        callbackClientProperties(obj as ClientsProperties);
      } else {
        callbackObjPayLoads(obj as ObjPayLoads);
        //console.log("callbackObjPayLoads(obj);");
      }
    });
  }

  //Method to disconnect
  disconnect() {
    this.client!.end(() => {
      console.log("Disconnected");
    });
  }

  //Method to check if client exist or not
  isClientExist(): boolean {
    if (!this.client) {
      console.log("Client doesn't exist");
      return false;
    }
    return true;
  }

  //Method to send Client Properties
  sendPinkACK(obj: ClientsProperties) {
    this.client!.publish(
      obj.topic!,
      JSON.stringify(obj),
      this.optionPublish,
      (err) => {
        if (err) {
          console.log(
            `Failed to send message: ${obj}, topic: ${obj.topic}`,
          );
        } else {
          console.log(
            `Successfully send Ping ACK sender: ${obj.sender}, topic: ${obj.topic},`,
          );
        }
      },
    );
  }
}
