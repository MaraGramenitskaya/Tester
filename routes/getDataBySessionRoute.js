const { connect, initializeDatabase } = require("../utils");

async function getDataBySessionHandler(req, res) {
    try {
        const lastSession = await initializeDatabase();
        const connection = await connect();
        const sql_query = `SELECT timestamp, Sample, Max_temp, Temp_1, Temp_2, Temp_3, Temp_4, Temp_5, Temp_6, Temp_7, Trigger_1, Trigger_2, Trigger_3, Trigger_4, Trigger_5, Trigger_6, Trigger_7 FROM test WHERE session = ?`;
        const [result] = await connection.query(sql_query, [lastSession]);
        await connection.end();
        res.json(result);
    } catch (err) {
        console.error(`Error sending response from /getDataBySession: ${err}`);
        res.status(500).send({ message: "Error sending data from /getDataBySession" });
    }
};

module.exports = getDataBySessionHandler;