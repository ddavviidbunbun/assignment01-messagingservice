import MQTTLibrary from "../mqttLibrary/index.mjs"; // Sesuaikan path
import readline from "readline";

const brokerUrl = "mqtt://localhost:1883";
const client = new MQTTLibrary(brokerUrl);

// Inisialisasi readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect client
client.connect();
// Event listener untuk menerima pesan dari client lain

client.subscribe(["home/room1"], 0);
client.onMessage((topic, message, whoo) => {
  console.log(`Received message on topic "${topic}" from ${whoo}: ${message}`);
});

console.log('Enter the message to send (or type "exit" to quit): ');
rl.on("line", (message) => {
  switch (message.toLowerCase()) {
    case "exit":
      console.log("Exiting...");
      client.disconnect();
      rl.close();
      break;
    default:
      console.log(`Sending message: ${message}`);
      client.sendUnicast("home/room1", client.clientId + "/" + message, 0);
      console.log('Enter the message to send (or type "exit" to quit): ');
      break;
  }
});
