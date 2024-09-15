import mqtt from 'mqtt';

class MQTTLibrary {
  constructor(brokerUrl) {
    this.brokerUrl = brokerUrl;
    this.client = null;
    this.clientId = `client_mqtt_${Math.random().toString(10).slice(2,4)}`; // Sesuaikan dengan kebutuhan
    this.subscribedTopics = [];
  }

  clientID(){
    return this.clientId;
  }

  // Function to connect to the broker with unique ID
  connect(clientId = this.clientId) {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(this.brokerUrl, { clientId });

      this.client.on('connect', () => {
        console.log(`Connected as ${clientId}`);
        resolve();
      });

      this.client.on('error', (err) => {
        console.error("Connection error: ", err);
        this.client.end();
        reject(err);
      });

      this.client.on('message', (topic, message) => {
        console.log(`Received message on topic "${topic}": ${message.toString()}`);
      });
    });
  }

  // Function to subscribe to topics (unicast or multicast)
  subscribe(topics, qos = 0) {
    if (!this.client) {
      throw new Error('Client not connected');
    }

    topics.forEach((topic) => {
      this.client.subscribe(topic, { qos }, (err) => {
        if (err) {
          console.error(`Failed to subscribe to topic "${topic}":`, err);
        } else {
          this.subscribedTopics.push(topic);
          console.log(`Subscribed to topic "${topic}"`);
        }
      });
    });
  }

  // Function to send message to a single topic (unicast)
  sendUnicast(topic, message, qos = 0) {
    if (!this.client) {
      throw new Error('Client not connected');
    }

    this.client.publish(topic, message, { qos }, (err) => {
      if (err) {
        console.error(`Failed to publish message to topic "${topic}":`, err);
      } else {
        console.log(`Message sent to "${topic}": ${message}`);
      }
    });
  }

  // Function to send message to multiple topics (multicast)
  sendMulticast(topics, message, qos = 0) {
    if (!this.client) {
      throw new Error('Client not connected');
    }

    topics.forEach((topic) => {
      this.client.publish(topic, message, { qos }, (err) => {
        if (err) {
          console.error(`Failed to publish message to topic "${topic}":`, err);
        } else {
          console.log(`Message sent to "${topic}": ${message}`);
        }
      });
    });
  }

  // Two-way communication handler
  onMessage(callback) {
    if (!this.client) {
      throw new Error('Client not connected');
    }

    this.client.on('message', (topic, message) => {
      callback(topic, message.toString());
    });
  }

  // Disconnect client
  disconnect() {
    if (!this.client) {
      throw new Error('Client not connected');
    }

    this.client.end(() => {
      console.log('Disconnected from broker');
    });
  }
}

export default MQTTLibrary;