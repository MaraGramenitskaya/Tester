const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.json());

const { client } = require("./mqtt");
const { crcTable, column, connect, insertMessageIntoDatabase, crc16, initializeDatabase } = require("./utils");
const sendMessageHandler = require("./routes/sendMessageRoute");
const getAllHandler = require("./routes/getAllRoute");
const mainHandler = require("./routes/mainRoute");
const graphHandler = require("./routes/graphRoute");
const getDataBySessionHandler = require("./routes/getDataBySessionRoute")
const getSessionHandler = require("./routes/getSessionRoute")
const confirmSessionHandler = require("./routes/confirmSessionRoute")
const port = require("./.env").brilliantPort;

let start = false;
let timeoutId = null;
let checkboxStates;
let cachedMessage = "";
let lastIndex = "";
let hash = "";
let lastSession;

async function viewLastSession() {
    lastSession = await initializeDatabase();
}
viewLastSession();


client.on("message", (receivedTopic, payload) => {
    console.log("Received Message:", receivedTopic, payload.toString());

    if (receivedTopic === "test/Temp") {
        cachedMessage = payload.toString();
        lastIndex = cachedMessage.lastIndexOf(",");
        hash = cachedMessage.slice(lastIndex + 1);
        cachedMessage = cachedMessage.slice(0, lastIndex);

        if (crc16(cachedMessage + ",").toString(16) == hash) {
            if (start == true) {
                const arr = cachedMessage.split(",");
                const date = new Date();
                const offset = date.getTimezoneOffset();
                const localTime = new Date(date.getTime() + offset * -60000);
                const values = [localTime];
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === "error") {
                        values.push(null);
                        if (arr[i + 1] === "1" || arr[i + 1] === "0") {
                            values.push(null);
                            i++;
                        }
                    } else if (!checkboxStates[Math.floor(i / 2)]) {
                        values.push(null);
                    } else {
                        values.push(Number(arr[i]));
                    }
                };
                values.push(lastSession);
                insertMessageIntoDatabase(column, values);
            }
        }
    }
});

app.post("/send-message", sendMessageHandler);

app.get("/", mainHandler);

app.get("/graph", graphHandler);

app.get("/getAllSessions", getAllHandler);

app.get("/getDataBySession", getDataBySessionHandler);

app.post("/getSessions", getSessionHandler);

app.post("/confirmSession", confirmSessionHandler);

app.post("/start", (req, res) => {
    try {
        const min = req.body.min;
        const sec = req.body.sec;
        checkboxStates = req.body.checkboxStates;
        checkboxStates = true + "," + checkboxStates;
        console.log(`checkboxStates: ${checkboxStates}`);
        start = true;
        lastSession++;
        console.log("Start session:", lastSession);
        timeoutId = setTimeout(() => {
            start = false;
            console.log(`Session is over`);
        }, min * 60 * 1000 + sec * 1000);
        console.log(`Timer started for ${min} minutes and ${sec} seconds`);
        res.send(`Timer started for ${min} minutes and ${sec} seconds\nStart session: ${lastSession}`);
    } catch (err) {
        console.error(`Error connecting to MySQL database: ${err.message}`);
        res.status(500).send({ message: "Error sending data from /start" });
    }
});

app.post("/stop", (req, res) => {
    try {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        start = false;
        res.send("Timer stopped");
        console.log(`Session is over`);

    } catch (err) {
        console.error(`Error sending data from /stop: ${err}`);
        res.status(500).json({ message: "Error sending data from /stop" });
    }
});

app.get("/checkUpdates", (req, res) => {
    try {
        res.send(cachedMessage);
    } catch (err) {
        console.error(`Error sending response from /update: ${err}`);
        res.status(500).send({ message: "Error sending data from /update" });
    }
});

app.post("/getLastSession", (req, res) => {
    try {
        res.json({ lastSession });
    } catch (err) {
        console.error(`Error sending data from /lastSession: ${err}`);
        res.status(500).json({ message: "Error sending data from /lastSession" });
    }
});

app.listen(port, () => {
    console.log(`Server : http://192.168.1.10:${port}`);
});