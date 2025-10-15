import mysql from 'mysql2';

const DBconfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB
};

const pool = mysql.createPool(DBconfig);

export default function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const myBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { select, table, column, id } = myBody;


        // Validar ID
        if (!id || (typeof id === 'number' && isNaN(id))) {
            res.status(400).send({ error: 'Invalid id' });
            return;
        }

        const sql = `SELECT ${select} FROM ${table} WHERE ${column} = ? and status=1`;

        pool.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).send({ error: 'Error executing query' });
                return;
            }

            if (result.length === 0) {
                res.status(404).send({ error: 'Record not found' });
                return;
            }

            res.status(200).send(result);
        });

    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}