const { connect } = require("../utils");
const { client } = require("../mqtt");

async function sendMessageHandler(req, res) {
    try {
        const qos = 2;
        let inputValue = String(req.body.input);
        if (!(inputValue.toString().match(/\./))) {
            inputValue += ".0"
        }
        console.log(`Received test/Max: ${inputValue}`);
        client.publish("test/Max", inputValue, { qos, retain: false });

        const connection = await connect();
        const query = `INSERT INTO test (Max_temp) VALUES (?)`;
        const [result] = await connection.query(query, [inputValue]); 
        await connection.end();

        res.send(`Message published to topic "test/Max": ${inputValue}`);
    } catch (err) {
        console.error(`Error sending data from /send-message: ${err}`);
        res.status(500).send({ message: "Error sending data from /send-message" });
    }
};

module.exports = sendMessageHandler;