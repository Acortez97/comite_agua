import mysql from 'mysql2/promise'
import md5 from 'md5'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' })
    }

    const { usuario, pass } = req.body

    if (!usuario || !pass) {
        return res.status(400).json({ message: 'Faltan datos' })
    }

    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB,
            connectionLimit: 20
        })

        const [rows] = await connection.execute(
            'SELECT idusers, usuario, rol FROM users_admins WHERE usuario = ? AND pass = ?',
            [usuario, md5(pass)]
        )

        await connection.end()

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' })
        }

        const usuarioBD = rows[0]  // <--- Nombre cambiado

        return res.status(200).json({
            message: 'Login exitoso',
            user: {
                id: usuarioBD.idusers,
                usuario: usuarioBD.usuario,
                rol: usuarioBD.rol,
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Error en el servidor' })
    }
}
