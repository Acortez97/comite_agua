import mysql from 'mysql2/promise'
import md5 from 'md5'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  const { data } = req.body
  if (!data) {
    return res.status(400).json({ message: 'Datos faltantes' })
  }

  const { nombre, apellido, usuario, pass, rol, fecha_creacion } = data

  if (!nombre || !usuario || !pass || !rol) {
    return res.status(400).json({ message: 'Campos obligatorios incompletos' })
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
    })

    // Validar existencia previa
    const [exists] = await connection.execute(
      'SELECT idusers FROM users_admins WHERE usuario = ?',
      [usuario]
    )

    if (exists.length > 0) {
      await connection.end()
      return res.status(409).json({ message: 'El usuario ya existe' })
    }

    // Insertar usuario con contraseña encriptada
    await connection.execute(
      `INSERT INTO users_admins (nombre, apellido, usuario, pass, rol, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, usuario, md5(pass), rol, fecha_creacion || new Date()]
    )

    await connection.end()

    return res.status(201).json({ message: 'Usuario registrado correctamente' })
  } catch (error) {
    console.error('Error en el servidor:', error)
    return res.status(500).json({ message: 'Error en el servidor' })
  }
}
