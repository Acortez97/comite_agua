import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withAuthRole from '../../components/withAuthRole'


function Registro_users() {

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [usuario, setUsuario] = useState('');
    const [pass, setPass] = useState('');
    const [rol, setRol] = useState('');
    const [domicilio, setDomicilio] = useState('');

    // --- Lógica de guardado a DB ---
    function getFechaLocal() {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const offset = now.getTimezoneOffset();
        now.setMinutes(now.getMinutes() - offset);
        const año = now.getFullYear();
        const mes = pad(now.getMonth() + 1);
        const dia = pad(now.getDate());
        return `${año}-${mes}-${dia}`;
    }


    const guardarUsuario = async () => {
        const payload = {
            nombre: nombre,
            apellido: apellido,
            usuario: usuario,
            pass: pass,
            rol: rol,
        };

        if (payload.nombre === '' || payload.nombre === undefined) {
            Swal.fire({ icon: 'error', title: '¡Error!', text: 'El Nombre del USUARIO es OBLIGATORIO.' });
            return;
        }
        const data = { table: 'users_admins', data: { ...payload, fecha_creacion: getFechaLocal() } };
        const response = await fetch('/api/InsertGeneral/insert_rol', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const results = await response.json();
        console.log(results)
        if (!response.ok) { throw new Error(results?.message || 'Error al insertar'); }
        Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'Los datos se han guardado correctamente.' })

        // Limpiar y recargar
        setNombre('')
        setApellido('')
        setUsuario('')
        setPass('')
        setRol('')

    };

    return (
        <>

            <div style={{
                maxWidth: '600px',
                margin: '40px auto',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Registro de Usuarios</h1>

                <form onSubmit={(e) => {
                    e.preventDefault(); // ❗ Evita recarga
                    guardarUsuario();   // Ejecuta la lógica
                }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label><b>Nombre:</b></label>
                        <input
                            type="text"
                            required
                            placeholder="NOMBRE DEL USUARIO"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Apellido:</b></label>
                        <input
                            type="text"
                            placeholder="APELLIDO O APELLIDOS"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Usuario:</b></label>
                        <input
                            type="text"
                            placeholder="USUARIO PARA INICIAR SESIÓN"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Contraseña:</b></label>
                        <input
                            type="password"
                            placeholder="CONTRASEÑA"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Rol:</b></label>
                        <input
                            type="text"
                            placeholder="admin o user"
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <button type="submit" style={buttonStyle}>Registrar Usuario</button>
                </form>
            </div>
        </>
    )
}
export default withAuthRole(Registro_users, ['admin'])
// 🎨 Estilos reutilizables
const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '0.95rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    marginTop: '5px'
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#0077b6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px'
};