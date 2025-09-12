const mysql = require('mysql2');
const crypto = require('crypto');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 20
});

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    let myBody = req.body;
    if (typeof req.body === 'string') {
        myBody = JSON.parse(req.body);
    }

    const { idusers, newPass } = myBody;

    if (!idusers || !newPass) {
        return res.status(400).json({ error: 'Faltan parámetros idusers o newPass' });
    }

    // Hashear la nueva contraseña con MD5
    const hashedPass = crypto.createHash('md5').update(newPass).digest('hex');

    const sql = `UPDATE users_admins SET pass = ? WHERE idusers = ?`;
    const values = [hashedPass, idusers];

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener conexión de la base de datos:', err.stack);
            return res.status(500).json({ error: 'Error al conectarse a la base de datos' });
        }

        connection.query(sql, values, (err, result) => {
            connection.release();

            if (err) {
                console.error('Error ejecutando la consulta:', err.stack);
                return res.status(500).json({ error: 'Error al ejecutar la consulta' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json({ message: 'Contraseña actualizada correctamente' });
        });
    });
}
