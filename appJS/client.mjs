import MQTTLibrary from '../mqttLibrary/index.mjs'; // Sesuaikan path
import readline from 'readline';

const brokerUrl = 'mqtt://localhost:1883';
const client = new MQTTLibrary(brokerUrl);

// Inisialisasi readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fungsi untuk mengirim pesan secara berkelanjutan
function promptMessage() {
  rl.question('Enter the message to send (or type "exit" to quit): ', (message) => {
    if (message.toLowerCase() === 'exit') {
      console.log("Exiting...");
      client.disconnect();
      rl.close();
      process.exit();
    } else {
      // Mengirim pesan ke topik 'home/room1'
      console.log(`Sending message: ${message}`);
      client.sendUnicast('home/room1', client.clientId+"/"+message,0);
      promptMessage(); // Call promptMessage lagi untuk terus meminta input
    }
  });
}

// Connect client
client.connect()
  .then(() => {
    console.log(`Connected as ${client.clientId}`);

    // Subscribe ke topik 'home/room1' untuk menerima pesan
    return client.subscribe(['home/room1'], 0);
  })
  .then(() => {
    console.log(`Subscribed to topic 'home/room1'`);

    // Event listener untuk menerima pesan dari client lain
    client.onMessage((topic, message, whoo) => {
      console.log(`Received message on topic "${topic}" from ${whoo}: ${message}`);
    });

    // Memulai input untuk mengirim pesan
    promptMessage();
  })
  .catch((err) => {
    console.error('Error:', err);
  });
