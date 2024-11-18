import { it } from "node:test";
import { client, rl } from "..";
import { ClientsProperties } from "../MQTT-Library/libClientMQTT";

enum Command {
    CONNECT,
    DISCONNECT,
    SUB,
    UNSUB,
}

const callBack = () => {
    console.log("Sending ACK");
    const subTopics = client.getSubTopics;
    let obj: ClientsProperties;
    for (let i: number = 0; i < subTopics.length; i++) {
        obj = {
            sender: client.getClientId,
            neighbor: undefined,
            topic: subTopics[i],
            ping: "ACK",
            status: "DEAD",
        };
        client.sendPinkACK(obj as ClientsProperties);
        client.setClientACK = "ACK";
    }
};

const callBackCheckingStatus = () => {
    client.setManyClients = "";
    const prin = client.getManyClients;
    prin.map((item: ClientsProperties) => {
        console.log(
            `neighbor: ${item.neighbor} ,status: ${item.status}, topic: ${item.topic}`,
        );
    });
};

export const timer: NodeJS.Timer = setInterval(callBack, 5000);
export const timerCheckingStatus: NodeJS.Timer = setInterval(
    callBackCheckingStatus,
    10000,
);
