import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Papa from 'papaparse';
import withAuthRole from '../../components/withAuthRole';

function Registro_usuarios() {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [ap_pat, setAp_pat] = useState('');
    const [ap_mat, setAp_mat] = useState('');
    const [num_cel, setNum_cel] = useState('');
    const [correo, setCorreo] = useState('');
    const [domicilio, setDomicilio] = useState('');

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
            correo,
            domicilio,
            status: 1,
        };

        const data = { table: 'usuarios', data: { ...payload, fecha_creacion: getFechaLocal() } };
        const response = await fetch('/api/InsertGeneral/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const results = await response.json();
        if (!response.ok) {
            Swal.fire('Error', results?.error || 'Error al insertar', 'error');
            return;
        }
        Swal.fire('¡Registro exitoso!', 'Los datos se han guardado correctamente.', 'success');

        setNombreUsuario('');
        setAp_mat('');
        setAp_pat('');
        setCorreo('');
        setDomicilio('');
        setNum_cel('');
    };

    // --- NUEVO: Función para carga masiva CSV ---
    const cargaMasivaCSV = () => {
    Swal.fire({
        title: 'Carga masiva de usuarios desde CSV',
        html: `<input type="file" id="csvFileInput" accept=".csv" />`,
        showCancelButton: true,
        confirmButtonText: 'Subir',
        preConfirm: () => {
            const input = Swal.getPopup().querySelector('#csvFileInput');
            if (!input.files[0]) {
                Swal.showValidationMessage('Por favor selecciona un archivo CSV');
            }
            return input.files[0];
        },
    }).then((result) => {
        if (result.isConfirmed) {
            const file = result.value;

            // Función para obtener fecha local en formato YYYY-MM-DD
            const getFechaLocal = () => {
                const now = new Date();
                const pad = (n) => n.toString().padStart(2, '0');
                const offset = now.getTimezoneOffset();
                now.setMinutes(now.getMinutes() - offset);
                const año = now.getFullYear();
                const mes = pad(now.getMonth() + 1);
                const dia = pad(now.getDate());
                return `${año}-${mes}-${dia}`;
            };

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    const dataCSV = results.data;

                    if (!dataCSV.length) {
                        Swal.fire('Error', 'El archivo CSV está vacío o mal formado', 'error');
                        return;
                    }

                    const camposRequeridos = ['Nombre'];
                    const faltantes = camposRequeridos.filter(campo => !(campo in dataCSV[0]));
                    if (faltantes.length) {
                        Swal.fire('Error', `Campos faltantes en CSV: ${faltantes.join(', ')}`, 'error');
                        return;
                    }

                    // Agregar fecha_creacion por defecto a cada usuario
                    const fechaCreacion = getFechaLocal();
                    const usuariosConFecha = dataCSV.map(usuario => ({
                        ...usuario,
                        fecha_creacion: fechaCreacion,
                    }));

                    try {
                        const response = await fetch('/api/InsertGeneral/importUserCsv', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ usuarios: usuariosConFecha }),
                        });

                        const resData = await response.json();
                        if (!response.ok) {
                            Swal.fire('Error', resData.error || 'Error al importar CSV', 'error');
                            return;
                        }

                        Swal.fire('Éxito', `Usuarios importados correctamente (${usuariosConFecha.length})`, 'success');
                    } catch (error) {
                        Swal.fire('Error', 'Error al subir archivo CSV', 'error');
                    }
                },
                error: (error) => {
                    Swal.fire('Error', 'Error al leer archivo CSV: ' + error.message, 'error');
                }
            });
        }
    });
};

    return (
        <div
            style={{
                maxWidth: '600px',
                margin: '40px auto',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
        >
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Registro de Usuarios</h1>

            {/* Botón para carga masiva CSV */}
            <button onClick={cargaMasivaCSV} style={{ ...buttonStyle, marginBottom: '20px' }}>
                Carga masiva de usuarios (CSV)
            </button>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    guardarUsuario();
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
                <div>
                    <label>
                        <b>Nombre:</b>
                    </label>
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
                    <label>
                        <b>Apellido Paterno:</b>
                    </label>
                    <input
                        type="text"
                        placeholder="APELLIDO PATERNO"
                        value={ap_pat}
                        onChange={(e) => setAp_pat(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label>
                        <b>Apellido Materno:</b>
                    </label>
                    <input
                        type="text"
                        placeholder="APELLIDO MATERNO"
                        value={ap_mat}
                        onChange={(e) => setAp_mat(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label>
                        <b>Número de celular:</b>
                    </label>
                    <input
                        type="text"
                        placeholder="NÚMERO CELULAR"
                        value={num_cel}
                        onChange={(e) => setNum_cel(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label>
                        <b>Correo:</b>
                    </label>
                    <input
                        type="email"
                        placeholder="CORREO"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label>
                        <b>Domicilio:</b>
                    </label>
                    <input
                        type="text"
                        placeholder="DOMICILIO"
                        value={domicilio}
                        onChange={(e) => setDomicilio(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <button type="submit" style={buttonStyle}>
                    Registrar Usuario
                </button>
            </form>
        </div>
    );
}

export default withAuthRole(Registro_usuarios, ['admin']);

const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '0.95rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    marginTop: '5px',
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#0077b6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
};
