// /pages/api/Selectgeneric/Select_Gen.js
const mysql = require('mysql2');

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

  const { select, table, where, orderBy } = myBody;

  if (!select || !table) {
    return res.status(400).json({ error: 'Faltan parámetros select o table' });
  }

  // Construye la consulta SQL dinámica con joins permitidos
  let sql = `SELECT ${select} FROM ${table}`;
  if (where) sql += ` WHERE ${where}`;
  if (orderBy) sql += ` ORDER BY ${orderBy}`;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error al obtener conexión de la base de datos:', err.stack);
      return res.status(500).json({ error: 'Error al conectarse a la base de datos' });
    }

    connection.query(sql, (err, result) => {
      connection.release();

      if (err) {
        console.error('Error ejecutando la consulta:', err.stack);
        return res.status(500).json({ error: 'Error al ejecutar la consulta', detalle: err.sqlMessage });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'No se encontraron resultados' });
      }

      res.status(200).json(result);
    });
  });
}
