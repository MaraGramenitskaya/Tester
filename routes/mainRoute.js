const path = require("path");

async function mainHandler(req, res) {
    try {
        res.sendFile(path.join(__dirname, "index.html"));
    } catch (err) {
        console.error(`Error sending data from index.html: ${err}`);
        res.status(500).send({ message: "Error sending data from index.html" });
    }
};

module.exports = mainHandler;