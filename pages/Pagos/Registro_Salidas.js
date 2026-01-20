/**
`idsalidas` INT NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(500) NULL,
  `monto` VARCHAR(45) NULL,
  `fecha` DATETIME NULL,
  `autoriza` VARCHAR(45) NULL,
  `status` INT NULL DEFAULT 1, 
*/
import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Select } from '@mui/material';
import withAuthRole from '../../components/withAuthRole'
import { jsPDF } from 'jspdf';


function Registro_salidas() {

    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
     const [monto, setMonto] = useState('');
    const [autoriza, setAutoriza] = useState('');
    const [observaciones, setObservaciones] = useState('');

    const logoUrl = '/logoagua.png';


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

    function borrar() {
        
        setMonto('');
        setObservaciones('');
        setDescripcion('');
        setAutoriza('');
        setFecha('')
    }


    const guardarPago = async () => {
        const payload = {
            descripcion: descripcion,
            monto: monto,
            fecha: fecha,
            autoriza: autoriza,
            observaciones: observaciones
        };

        console.log("Payload a guardar:", payload);

        const data = { table: 'salidas', data: { ...payload, fecha_registro: getFechaLocal() } };
        const response = await fetch('/api/InsertGeneral/insert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const results = await response.json();
        console.log(results)
        if (!response.ok) { throw new Error(results?.error || 'Error al insertar'); }
        Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'Los datos se han guardado correctamente.' })

      /*  generarPDF({
            usuario: usuarios.find(u => String(u.id_usuario) === String(usuarioSeleccionado))?.Contratante || '',
            num_contrato,
            anio_pago,
            mes_pago,
            monto_pago,
            metodo_pago,
            observaciones,
            fecha_registro: getFechaLocal(),
        });*/
        // Limpiar y recargar
        borrar();
    };


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
        doc.text(`CONCEPTO: PAGO DE ANUALIDAD`, pageWidth - 15, 58, { align: 'right' });
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
            'Este recibo certifica que el pago por concepto de anualidad ha sido realizado correctamente ante el Comité del Agua Potable.\n' +
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
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Registro de Salidas</h1>

                <form onSubmit={(e) => {
                    e.preventDefault(); // ❗ Evita recarga
                    guardarPago();   // Ejecuta la lógica
                }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div>
                        <label><b>Descripción:</b></label>
                        <input
                            type="text"
                            placeholder="EJEMPLO: PAGO RECIBO DE LUZ #1234"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label><b>Monto a Pagar:</b></label>
                        <input
                            type="number"
                            placeholder="INGRESA EL MONTO TOTAL"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label><b>Fecha:</b></label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label><b>Autoriza:</b></label>
                        <input
                            type="text"
                            placeholder="QUIEN AUTORIZA LA COMPRA"
                            value={autoriza}
                            onChange={(e) => setAutoriza(e.target.value)}
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
export default withAuthRole(Registro_salidas, ['admin'])

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
