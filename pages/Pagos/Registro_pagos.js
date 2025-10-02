import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Select } from '@mui/material';
import withAuthRole from '../../components/withAuthRole'


function Registro_pagos() {

    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(''); // id seleccionado
    const [contratoSeleccionado, setContratoSeleccionado] = useState(''); // id seleccionado
    const [num_contrato, setNum_contrato] = useState('');
    const [anio_pago, setAnio_pago] = useState('');
    const [mes_pago, setMes_pago] = useState('');
    const [monto_pago, setMonto_pago] = useState('');
    const [metodo_pago, setMetodo_pago] = useState('');
    const [observaciones, setObservaciones] = useState('');


    const [usuarios, setUsuarios] = useState([]);
    const [contrato, setContrato] = useState([]);

    // --- Lógica de guardado a DB ---
    function getFechaLocal() {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');

        // Ajustar al horario local
        const año = now.getFullYear();
        const mes = pad(now.getMonth() + 1);
        const dia = pad(now.getDate());
        const horas = pad(now.getHours());
        const minutos = pad(now.getMinutes());
        const segundos = pad(now.getSeconds());

        return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
    }




    React.useEffect(() => {
        fetch('/api/Selectgeneric/Select_Gen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                select: 'id_usuario, CONCAT_WS("",Nombre, " ", Apellido_pat, " ", Apellido_mat) AS Contratante',
                table: 'usuarios',
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) {
                    setUsuarios(data);
                }
            })
            .catch((err) => console.error('Error al obtener usuarios:', err));
    }, []);
    /* React.useEffect(() => {
         if (!usuarioSeleccionado) {
             setContrato([]); // Limpiar contratos si no hay usuario
             return;
         }
 
         fetch('/api/Selectgeneric/SelectWithWhere', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 select: 'id_Contrato, num_contrato, id_usuario',
                 table: 'contratos',
                 column: 'id_usuario',
                 id: usuarioSeleccionado,
             })
         })
             .then((res) => res.json())
             .then((data) => {
                 if (!data.error) {
                     setContrato(data);
                 }
             })
             .catch((err) => console.error('Error al obtener usuarios:', err));
     }, [[usuarioSeleccionado]]);*/

    const [lastUsuarioConsultado, setLastUsuarioConsultado] = useState(null);

    useEffect(() => {
        // Solo hacer fetch si el usuario seleccionado ha cambiado realmente
        if (!usuarioSeleccionado || usuarioSeleccionado === lastUsuarioConsultado) {
            return;
        }

        setLastUsuarioConsultado(usuarioSeleccionado); // Guardamos para comparar

        fetch('/api/Selectgeneric/SelectWithWhere', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                select: 'id_contrato, num_contrato, id_usuario',
                table: 'contratos',
                column: 'id_usuario',
                id: usuarioSeleccionado,
            })
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) {
                    setContrato(data);
                } else {
                    setContrato([]);
                }
            })
            .catch((err) => {
                console.error('Error al obtener contratos:', err);
                setContrato([]);
            });
    }, [usuarioSeleccionado, lastUsuarioConsultado]);


    function borrar() {
        setUsuarioSeleccionado('');
        setNum_contrato('');
        setFecha_contrato('');
        setRespon_comite('');
    }
    console.log("los datos del usuario: ", usuarios)
    const guardarPago = async () => {
        const payload = {
            id_usuario: usuarioSeleccionado,
            num_contrato: num_contrato,
            Fecha_contrato: Fecha_contrato,
            respon_comite: respon_comite,
            status: 1,
        };

        if (payload.id_usuario === '' || payload.id_usuario === undefined) {
            Swal.fire({ icon: 'error', title: '¡Error!', text: 'El USUARIO es OBLIGATORIO.' });
            return;
        }
        const data = { table: 'contratos', data: { ...payload, fecha_creacion: getFechaLocal() } };
        const response = await fetch('/api/InsertGeneral/insert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const results = await response.json();
        console.log(results)
        if (!response.ok) { throw new Error(results?.error || 'Error al insertar'); }
        Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'Los datos se han guardado correctamente.' })

        // Limpiar y recargar
        borrar();


    };
    console.log("el usuario seleccionado: ", contratoSeleccionado)
    const [busquedaUsuario, setBusquedaUsuario] = useState('');

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
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Registro de Pagos</h1>

                <form onSubmit={(e) => {
                    e.preventDefault(); // ❗ Evita recarga
                    guardarPago();   // Ejecuta la lógica
                }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/*<div>
                        <label><b>Nombre:</b></label>
                        <select
                            required
                            value={usuarioSeleccionado}
                            onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">SELECCIONE EL CONTRATANTE</option>
                            {usuarios.map((usuario) => (
                                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                    {usuario.Contratante}
                                </option>
                            ))}
                        </select>
                    </div>*/}
                    <div>
                        <label><b>Buscar Usuario:</b></label>
                        <input
                            type="text"
                            placeholder="Escribe el nombre del contratante"
                            value={busquedaUsuario}
                            onChange={(e) => setBusquedaUsuario(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label><b>Nombre:</b></label>
                        <select
                            required
                            value={usuarioSeleccionado}
                            onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">SELECCIONE EL CONTRATANTE</option>
                            {usuarios
                                .filter(usuario =>
                                    usuario.Contratante.toLowerCase().includes(busquedaUsuario.toLowerCase())
                                )
                                .map((usuario) => (
                                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                        {usuario.Contratante}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label><b># Contrato:</b></label>
                        <select
                            required
                            value={contratoSeleccionado}
                            onChange={(e) => setContratoSeleccionado(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">SELECCIONE UN CONTRATO</option>
                            {contrato.map((contrato) => (
                                <option key={contrato.id_contrato} value={contrato.id_contrato}>
                                    {contrato.num_contrato}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div>
                        <label><b>Año a pagar:</b></label>
                        <select
                            required
                            value={anio_pago}
                            onChange={(e) => setAnio_pago(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">SELECCIONE UN AÑO</option>
                            <option value="2000">2000</option>
                            <option value="2001">2001</option>
                            <option value="2002">2002</option>
                            <option value="2003">2003</option>
                            <option value="2004">2004</option>
                            <option value="2005">2005</option>
                            <option value="2006">2006</option>
                            <option value="2007">2007</option>
                            <option value="2008">2008</option>
                            <option value="2009">2009</option>
                            <option value="2010">2010</option>
                            <option value="2011">2011</option>
                            <option value="2012">2012</option>
                            <option value="2013">2013</option>
                            <option value="2014">2014</option>
                            <option value="2015">2015</option>
                            <option value="2016">2016</option>
                            <option value="2017">2017</option>
                            <option value="2018">2018</option>
                            <option value="2019">2019</option>
                            <option value="2020">2020</option>
                            <option value="2021">2021</option>
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                            <option value="2029">2029</option>
                            <option value="2030">2030</option>
                        </select>
                    </div>

                    <div>
                        <label><b>Fecha del Contrato:</b></label>
                        <select
                            required
                            value={mes_pago}
                            onChange={(e) => setMes_pago(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">SELECCIONE UN MES</option>
                            <option value="ENERO">ENERO</option>
                            <option value="FEBRERO">FEBRERO</option>
                            <option value="MARZO">MARZO</option>
                            <option value="ABRIL">ABRIL</option>
                            <option value="MAYO">MAYO</option>
                            <option value="JUNIO">JUNIO</option>
                            <option value="JULIO">JULIO</option>
                            <option value="AGOSTO">AGOSTO</option>
                            <option value="SEPTIEMBRE">SEPTIEMBRE</option>
                            <option value="OCTUBRE">OCTUBRE</option>
                            <option value="NOVIEMBRE">NOVIEMBRE</option>
                            <option value="DICIEMBRE">DICIEMBRE</option>
                        </select>
                    </div>

                    <div>
                        <label><b>Monto a Pagar:</b></label>
                        <input
                            type="NUMBER"
                            placeholder="INGRESA EL MONTO TOTAL A PAGAR"
                            value={monto_pago}
                            onChange={(e) => setMonto_pago(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label><b>Método de Pago:</b></label>
                        <input
                            type="text"
                            placeholder="INGRESA EL MÉTODO DE PAGO (EFECTIVO / TRANSFERENCIA)"
                            value={metodo_pago}
                            onChange={(e) => setMetodo_pago(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label><b>Observaciones:</b></label>
                        <input
                            type="text"
                            placeholder="¿HUBO ALGUNA OBSERVACIÓN?"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            style={inputStyle}
                        />
                    </div>




                    <button type="submit" style={buttonStyle}>Registrar Pago</button>
                </form>
            </div>
        </>
    )
}
export default withAuthRole(Registro_pagos, ['admin'])
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