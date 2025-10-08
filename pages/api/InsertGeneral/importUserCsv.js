import mysql from 'mysql2';

// Crear el pool de conexiones
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 20
});

// Función para ejecutar consultas SQL con promesas
const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { usuarios } = req.body;
        if (!Array.isArray(usuarios) || usuarios.length === 0) {
            return res.status(400).json({ error: 'No se enviaron usuarios' });
        }

        // Inserción masiva
        await Promise.all(
            usuarios.map(async (usuario) => {
                // Extraer campos para insert, asumiendo la tabla "usuarios"
                // Se puede ajustar si tienes más o menos campos
                const {
                    Nombre,
                    Apellido_pat,
                    Apellido_mat,
                    num_celular,
                    correo,
                    domicilio,
                    fecha_creacion // ya viene del cliente
                } = usuario;

                const sql = `
                    INSERT INTO usuarios 
                    (Nombre, Apellido_pat, Apellido_mat, num_celular, correo, domicilio, fecha_creacion, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                `;

                const params = [
                    Nombre,
                    Apellido_pat,
                    Apellido_mat || null,
                    num_celular,
                    correo,
                    domicilio || null,
                    fecha_creacion
                ];

                await executeQuery(sql, params);
            })
        );

        return res.status(200).json({ message: 'Usuarios importados correctamente', count: usuarios.length });
    } catch (error) {
        console.error('Error en API de carga masiva:', error);
        return res.status(500).json({ error: 'Error en servidor: ' + error.message });
    }
}
