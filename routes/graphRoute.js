const path = require("path");

async function graphHandler(req, res) {
    try {
        res.sendFile(path.join(__dirname, "../public/graph.html"));
    } catch (err) {
        console.error(`Error sending data from graph.html: ${err}`);
        res.status(500).send({ message: "Error sending data from graph.html" });
    }
};

module.exports = graphHandler;