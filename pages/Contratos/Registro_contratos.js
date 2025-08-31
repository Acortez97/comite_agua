import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';


export default function Registro_usuarios() {

    const [nombreUsuario, setNombreUsuario] = useState('');
    const [ap_pat, setAp_pat] = useState('');
    const [ap_mat, setAp_mat] = useState('');
    const [num_cel, setNum_cel] = useState('');
    const [correo, setCorreo] = useState('');
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
            Nombre: nombreUsuario,
            Apellido_pat: ap_pat,
            Apellido_mat: ap_mat,
            num_celular: num_cel,
            correo: correo,
            domicilio: domicilio,
            status: 1,
        };

        if (payload.Nombre === '' || payload.Nombre === undefined) {
            Swal.fire({ icon: 'error', title: '¡Error!', text: 'El Nombre del USUARIO es OBLIGATORIO.' });
            return;
        }
        const data = { table: 'usuarios', data: { ...payload, fecha_creacion: getFechaLocal() } };
        const response = await fetch('/api/InsertGeneral/insert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const results = await response.json();
        console.log(results)
        if (!response.ok) { throw new Error(results?.error || 'Error al insertar'); }
        Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'Los datos se han guardado correctamente.' })

        // Limpiar y recargar

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
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Apellido Paterno:</b></label>
                        <input
                            type="text"
                            placeholder="APELLIDO PATERNO"
                            value={ap_pat}
                            onChange={(e) => setAp_pat(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Apellido Materno:</b></label>
                        <input
                            type="text"
                            placeholder="APELLIDO MATERNO"
                            value={ap_mat}
                            onChange={(e) => setAp_mat(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Número de celular:</b></label>
                        <input
                            type="text"
                            placeholder="NÚMERO CELULAR"
                            value={num_cel}
                            onChange={(e) => setNum_cel(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Correo:</b></label>
                        <input
                            type="email"
                            placeholder="CORREO"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Domicilio:</b></label>
                        <input
                            type="text"
                            placeholder="DOMICILIO"
                            value={domicilio}
                            onChange={(e) => setDomicilio(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <button type="submit" style={buttonStyle}>Registrar Usuario</button>
                </form>
            </div>
        </>
    )
}
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