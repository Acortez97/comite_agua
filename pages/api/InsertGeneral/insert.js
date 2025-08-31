const mysql = require('mysql2');

// Crear el pool de conexiones correctamente
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 10 // Puedes ajustar el número de conexiones simultáneas
});

// Función para ejecutar consultas SQL con promesas
const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params, function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Method Not Allowed' });
        return;
    }

    try {
        let myBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { table, data } = myBody;

        if (!table || !data) {
            return res.status(400).send({ error: "Missing 'table' or 'data' in request body" });
        }

        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map(() => '?').join(', ');

        const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;

        //await executeQuery(sql, values);
        const result = await executeQuery(sql, values);


        //res.status(200).send({ message: 'Data inserted successfully' });
        res.status(200).send({
            message: 'Data inserted successfully',
            insertId: result.insertId, // 👈 esto devuelve el ID autogenerado
        });

    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send({ error: 'Error handling request' });
    }
}