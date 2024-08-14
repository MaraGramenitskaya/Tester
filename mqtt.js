const mqtt = require("mqtt");
const { mqttHost, mqttUsername, mqttPassword } = require("./app.config");
const clientId = "emqx_nodejs_" + Math.random().toString(16).substring(2, 8);
const qos = 2;
let subscribedTopics = ["test/Max", "test/Temp"];
const options = {
    clientId,
    host: mqttHost,
    port: 1883,
    clean: true,
    connectTimeout: 4000,
    username: mqttUsername,
    password: mqttPassword,
    reconnectPeriod: 1000,
};


const client = mqtt.connect(options);

//подключение к mqtt
client.on("connect", () => {
    console.log(`Connected to mqtt`);

    subscribedTopics.forEach((topic) => {
        client.subscribe(topic);
    });
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (input) => {
        const userInput = input.toString().trim();

        if (userInput === "disconnect") {
            client.end(false, () => {
                console.log("disconnected successfully");
            });
        } else if (userInput.startsWith("subscribe ")) {
            const topic = userInput.substring(9).trim();
            if (topic) {
                client.subscribe(topic);
                subscribedTopics.push(topic);
            } else {
                console.log("Invalid topic. Use 'subscribe <topic>'");
            }
        } else if (userInput.startsWith("unsubscribe ")) {
            const topic = userInput.substring(11).trim();
            if (topic) {
                client.unsubscribe(topic);
                const index = subscribedTopics.indexOf(topic);
                if (index !== -1) {
                    subscribedTopics.splice(index, 1);
                }
            } else {
                console.log("Invalid topic. Use 'unsubscribe <topic>'");
            }
        } else {
            const [topic, message] = userInput.split(" ", 2);
            if (topic && message) {
                client.publish(topic, message, { qos, retain: false });
            } else {
                console.log("Invalid input format. Use '<topic> <message>'");
            }
        }
    });
});

client.on("reconnect", (error) => {
    console.log(`Reconnecting to mqtt`, error);
});

client.on("error", (error) => {
    console.log(`Cannot connect to mqtt`, error);
});

module.exports = { client };