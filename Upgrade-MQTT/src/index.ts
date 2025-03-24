import ClientMQTT, { ClientsProperties } from "./MQTT-Library/libClientMQTT";
import readline from "readline";
import { timer, timerCheckingStatus } from "./MQTT-Service/libServiceMQTT";

console.log("hi");
console.log("lol");

const brokerUrl: string = "mqtt://localhost:1883";
export const client: ClientMQTT = new ClientMQTT(brokerUrl);
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

client.connect();
client.subscribe(["temp"]);
client.onMessage();
timer;
timerCheckingStatus;

rl.on("line", (input) => {
  switch (input.toLowerCase()) {
    case "exit":
      console.log("Exiting...");
      client.disconnect();
      rl.close();
      break;
    default:
      console.log(`Sending message: ${input}`);
      client.sendUniCast({
        sender: client.getClientId,
        receiver: ["PUBLIC"],
        topic: "temp",
        message: input,
      });
      console.log('Enter the message to send (or type "exit" to quit): ');
      break;
  }
});
