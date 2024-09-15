import MQTTLibrary from './mqttLibrary/index.mjs';

const brokerUrl = 'mqtt://localhost:1883';
const client1 = new MQTTLibrary(brokerUrl);

// Connect client 1
client1.connect().then(() => {
  // Subscribe to a topic
  client1.subscribe(['home/room1']);

  const client_ID = client1.clientID();

  // Listen for incoming messages
  client1.onMessage((topic, message) => {
    console.log(`${client_ID} Received on ${topic}: ${message}`);
  });

  // Send a message (unicast) to topic
  setTimeout(() => {
    client1.sendUnicast('home/room1', `Hello from ${client_ID}`);
  }, 3000);  // Send message after 3 seconds
});
