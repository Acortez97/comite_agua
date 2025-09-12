const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 20
});

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const sql = `SELECT idusers, usuario, nombre, apellido FROM users_admins`;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener conexión de la base de datos:', err.stack);
            return res.status(500).json({ error: 'Error al conectarse a la base de datos' });
        }

        connection.query(sql, (err, results) => {
            connection.release();

            if (err) {
                console.error('Error ejecutando la consulta:', err.stack);
                return res.status(500).json({ error: 'Error al ejecutar la consulta' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'No se encontraron usuarios' });
            }

            res.status(200).json(results);
        });
    });
}
