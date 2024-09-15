import MQTTLibrary from './mqttLibrary/index.mjs';

const brokerUrl = 'mqtt://localhost:1883';
const client1 = new MQTTLibrary(brokerUrl);

// Connect client 1
client1.connect('client1').then(() => {
  // Subscribe to a topic
  client1.subscribe(['home/room1']);

  // Listen for incoming messages
  client1.onMessage((topic, message) => {
    console.log(`[Client 1] Received on ${topic}: ${message}`);
  });

  // Send a message (unicast) to topic
  setTimeout(() => {
    client1.sendUnicast('home/room1', 'Hello from Client 1');
  }, 3000);  // Send message after 3 seconds
});
