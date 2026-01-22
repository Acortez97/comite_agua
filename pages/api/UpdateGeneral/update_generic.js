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

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({ error: 'JSON inválido en body' });
    }
  }

  const { table, updates, idField, idValue } = body;

  if (!table || !updates || !idField || typeof idValue === 'undefined') {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  // Construir SET parte de la query
  const fields = Object.keys(updates);
  if (fields.length === 0) {
    return res.status(400).json({ error: 'El objeto updates está vacío' });
  }

  const setClause = fields.map(field => `?? = ?`).join(', ');
  const values = [];
  fields.forEach(field => {
    values.push(field, updates[field]);
  });

  // Query con placeholders ?? para tabla y campos, ? para valores
  const sql = `UPDATE ?? SET ${setClause} WHERE ?? = ?`;

  // Valores para la query: tabla, campos y valores, idField e idValue
  const queryValues = [table, ...values, idField, idValue];

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión a BD' });
    }

    connection.query(sql, queryValues, (err, result) => {
      connection.release();

      if (err) {
        console.error('Error ejecutando consulta:', err);
        return res.status(500).json({ error: 'Error en consulta SQL' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró registro para actualizar' });
      }

      res.status(200).json({ message: 'Registro actualizado correctamente' });
    });
  });
}
