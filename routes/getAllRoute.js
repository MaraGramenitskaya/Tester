const { connect } = require("../utils");

async function getAllHandler(req, res) {
    try {
        const connection = await connect();
        const sql_query = `SELECT * FROM test`;
        const [result] = await connection.query(sql_query); 
        await connection.end();
        res.send(result);
    } catch (err) {
        console.error(`Error sending response from /all: ${err}`);
        res.status(500).send({ message: "Error sending data from /all" });
    }
};

module.exports = getAllHandler;