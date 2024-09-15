import MQTTLibrary from './mqttLibrary/index.mjs';

const brokerUrl = 'mqtt://localhost:1883';
const client3 = new MQTTLibrary(brokerUrl);

// Connect client 3
client3.connect('client3').then(() => {
  // Subscribe to a topic
  client3.subscribe(['home/room1', 'home/room2']);

  // Listen for incoming messages
  client3.onMessage((topic, message) => {
    console.log(`[Client 3] Received on ${topic}: ${message}`);
  });
});
