import MQTTLibrary from './mqttLibrary/index.mjs';

const brokerUrl = 'mqtt://localhost:1883';
const client2 = new MQTTLibrary(brokerUrl);

// Connect client 2
client2.connect().then(() => {
  const client_ID = client2.clientID();
  // Subscribe to a topic
  client2.subscribe(['home/room2', 'home/room1']);  // Subscribe to multiple topics

  // Listen for incoming messages
  client2.onMessage((topic, message) => {
    console.log(`${client_ID} Received on ${topic}: ${message}`);
  });

  // Send a message (multicast) to topics
  setTimeout(() => {
    client2.sendMulticast(['home/room1', 'home/room2'], `Hello from ${client_ID}`);
  }, 5000);  // Send message after 5 seconds
});
