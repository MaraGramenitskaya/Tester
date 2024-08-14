const { connect } = require("../utils");

async function getSessionHandler(req, res) {
    try {
        const connection = await connect();
        const date = req.body.date;
        const sql_query = `SELECT DISTINCT session FROM test WHERE DATE(timestamp) = ?`;
        const [results] = await connection.query(sql_query, [date]);
        res.send(results.map(row => row.session));
        await connection.end();
    }
    catch (err) {
        console.error(`Error sending data from /viewSession: ${err}`);
        res.status(500).json({ message: "Error sending data from /viewSession" });
    };
};

module.exports = getSessionHandler;