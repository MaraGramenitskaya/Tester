const { connect } = require("../utils");

async function confirmSessionHandler(req, res) {
    try {
        const connection = await connect();
        const sessionValue = req.body.session;
        const sql_query = `SELECT timestamp, Sample, Max_temp, Temp_1, Temp_2, Temp_3, Temp_4, Temp_5, Temp_6, Temp_7, Trigger_1, Trigger_2, Trigger_3, Trigger_4, Trigger_5, Trigger_6, Trigger_7 FROM test WHERE session = ?`;
        const [results] = await connection.query(sql_query, [sessionValue]);
        res.send(results);
        await connection.end();
    }
    catch (err) {
        console.error(`Error sending data from /confirmSession: ${err}`);
        res.status(500).json({ message: "Error sending data from /confirmSession" });
    };
};

module.exports = confirmSessionHandler;