import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Select } from '@mui/material';
import withAuthRole from '../../components/withAuthRole'
import { jsPDF } from 'jspdf';


function Registro_pagos() {

    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(''); // id seleccionado
    const [contratoSeleccionado, setContratoSeleccionado] = useState(''); // id seleccionado
    const [num_contrato, setNum_contrato] = useState('');
    const [anio_pago, setAnio_pago] = useState('');
    const [mes_pago, setMes_pago] = useState('');
    const [monto_pago, setMonto_pago] = useState('');
    const [metodo_pago, setMetodo_pago] = useState('');
    const [observaciones, setObservaciones] = useState('');
    // Si tienes un logo local o url
    const logoUrl = '/logoagua.png'; // ejemplo, ajusta al path correcto

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
        setBusquedaUsuario('');
        setUsuarioSeleccionado('');
        setContratoSeleccionado('');
        setNum_contrato('');
        setAnio_pago('');
        setMes_pago('');
        setMonto_pago('');
        setMetodo_pago('');
        setObservaciones('');
    }

    console.log("los datos del usuario: ", usuarios)

    const guardarPago = async () => {
        const payload = {
            id_usuario: usuarioSeleccionado,
            id_contrato: contratoSeleccionado,
            anio_pago: anio_pago,
            mes_pago: mes_pago,
            monto_pago: monto_pago,
            metodo_pago: metodo_pago,
            observaciones: observaciones,
            status: 1,
        };

        console.log("Payload a guardar:", payload);

        if (payload.id_usuario === '' || payload.id_usuario === undefined) {
            Swal.fire({ icon: 'error', title: '¡Error!', text: 'El USUARIO es OBLIGATORIO.' });
            return;
        }
        if (!payload.id_contrato) {
            Swal.fire({ icon: 'error', title: '¡Error!', text: 'El NÚMERO DE CONTRATO es OBLIGATORIO.' });
            return;
        }

        const data = { table: 'pagos', data: { ...payload, fecha_registro: getFechaLocal() } };
        const response = await fetch('/api/InsertGeneral/insert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const results = await response.json();
        console.log(results)
        if (!response.ok) { throw new Error(results?.error || 'Error al insertar'); }
        Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'Los datos se han guardado correctamente.' })

        generarPDF({
            usuario: usuarios.find(u => String(u.id_usuario) === String(usuarioSeleccionado))?.Contratante || '',
            num_contrato,
            anio_pago,
            mes_pago,
            monto_pago,
            metodo_pago,
            observaciones,
            fecha_registro: getFechaLocal(),
        });
        // Limpiar y recargar
        borrar();
    };

    // Función para generar el PDF
    /*function generarPDF(info) {
        const doc = new jsPDF();
        doc.addImage(logoUrl, 'PNG', 15, 10, 30, 30);
        doc.setFontSize(22);
        doc.text('Recibo de Pago', 105, 20, null, null, 'center');

        doc.setFontSize(12);
        doc.text(`Nombre: ${info.usuario}`, 20, 50);
        doc.text(`Número de Contrato: ${info.num_contrato}`, 20, 60);
        doc.text(`Año de Pago: ${info.anio_pago}`, 20, 70);
        doc.text(`Mes de Pago: ${info.mes_pago}`, 20, 80);
        doc.text(`Monto Pagado: $${info.monto_pago}`, 20, 90);
        doc.text(`Método de Pago: ${info.metodo_pago}`, 20, 100);
        doc.text(`Observaciones: ${info.observaciones || 'Ninguna'}`, 20, 110);
        doc.text(`Fecha de Registro: ${info.fecha_registro}`, 20, 120);

        // Línea decorativa
        doc.setLineWidth(0.5);
        doc.line(15, 135, 195, 135);

        // En vez de descargar, abrir en una nueva pestaña
        doc.save(`ReciboPago_${info.num_contrato}_${info.anio_pago}.pdf`)
        window.open(doc.output('bloburl'), '_blank');
    }*/
    function generarPDF(info) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 👉 Logo y encabezado
    const logoSize = 30;
    doc.addImage(logoUrl, 'PNG', 15, 10, logoSize, logoSize);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Comité del Agua Potable', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('San Gaspar Tlahuelilpan, Metepec, Estado de México', pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha de expedición: ${info.fecha_registro}`, pageWidth - 15, 35, { align: 'right' });

    // 👉 Título del recibo
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGO', pageWidth / 2, 50, { align: 'center' });

    // 👉 Cuerpo del recibo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const startY = 65;
    const lineHeight = 10;
    const fields = [
        [`Nombre del Contratante`, info.usuario],
        [`Número de Contrato`, info.num_contrato],
        [`Año de Pago`, info.anio_pago],
        [`Mes de Pago`, info.mes_pago],
        [`Monto Pagado`, `$${parseFloat(info.monto_pago).toFixed(2)}`],
        [`Método de Pago`, info.metodo_pago],
        [`Observaciones`, info.observaciones || 'Ninguna'],
    ];

    fields.forEach(([label, value], i) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 30, startY + i * lineHeight);

        doc.setFont('helvetica', 'normal');
        doc.text(`${value}`, 90, startY + i * lineHeight);
    });

    // 👉 Línea de separación
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(15, startY + fields.length * lineHeight + 10, pageWidth - 15, startY + fields.length * lineHeight + 10);

    // 👉 Aviso / nota legal
    const footerY = startY + fields.length * lineHeight + 25;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
        'Este recibo certifica que el pago ha sido realizado correctamente ante el Comité del Agua Potable.\n' +
        'Guarde este documento como comprobante oficial.\n\n' +
        'Aviso de privacidad: Los datos personales aquí registrados serán utilizados únicamente para fines administrativos\n' +
        'y de control interno del sistema de agua de San Gaspar Tlahuelilpan, Metepec, Edo. de México.',
        pageWidth / 2,
        footerY,
        { align: 'center' }
    );

     doc.save(`ReciboPago_${info.num_contrato}_${info.anio_pago}.pdf`)
    // 👉 Abrir PDF en nueva pestaña
    const pdfBlobUrl = doc.output('bloburl');
    window.open(pdfBlobUrl, '_blank');
}


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
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                setContratoSeleccionado(selectedId);

                                const contratoEncontrado = contrato.find(c => c.id_contrato == selectedId);
                                setNum_contrato(contratoEncontrado ? contratoEncontrado.num_contrato : '');
                            }}
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
                            {[...Array(31)].map((_, i) => {
                                const year = 2000 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
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
                            {["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"].map(mes => (
                                <option key={mes} value={mes}>{mes}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label><b>Monto a Pagar:</b></label>
                        <input
                            type="number"
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
